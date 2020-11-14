<template>
    <b-collapse class="mt-1 mb-2 px-0" v-model="isExpanded">
        <div class="accordion-content full-height">
            <div class="flex-center full-height" v-if="isSeriesLoading">
                <div class="spinner-border" role="status" style="width: 3rem; height: 3rem;">
                    <span class="sr-only"></span>
                </div>
                <span>Serie wird geladen...</span>
            </div>
            <div class="full-height flex-container" v-else>
                <div class="content-container container">
                    <div class="content-description py-3">{{seriesData.description}}</div>
                    <continue-series-button :series-episode-key="episodeToContinue.key" class="my-3"
                                            v-if="episodeToContinue"/>
                    <div class="content-series-items mb-2">
                        <div class="px-3 mt-1 flex-center white-tile">
                            <b>Staffeln:</b>
                        </div>
                        <series-season-button
                                v-for="season in seasons"
                                :key="season.key"
                                :active-season-key="selectedSeasonKey"
                                :season-info="season"
                                @clicked="seasonClicked"/>
                    </div>
                    <div v-if="episodes.length">

                        <div class="mb-2 mt-1 flex items-center justify-content-center" v-if="availableLanguages">
                            <language-icon class="mx-1"
                                           v-for="language in availableLanguages"
                                           :key="language"
                                           @click="languageClicked"
                                           :image-src="languageFlagMap[language].src"
                                           :title="languageFlagMap[language].title"
                                           :is-active="language === selectedLanguage"/>
                        </div>
                        <div class="content-series-items mb-3">
                        <span class="pz-3 mt-1 flex-center white-tile">
                            <b>Episoden:</b>
                        </span>
                            <series-episode-button
                                    v-for="seriesEpisode in episodes"
                                    :key="seriesEpisode.key"
                                    :episode-info="seriesEpisode"
                                    @clicked="episodeClicked"/>
                        </div>
                    </div>
                    <div v-if="areEpisodesLoading" class="flex-center my-3">
                        <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
                            <span class="sr-only"></span>
                        </div>
                        <span class="mt-2">Staffel wird geladen...</span>
                    </div>
                </div>
                <div class="cover float-right mx-3">
                    <img :src="seriesData.posterHref">
                </div>
            </div>
        </div>
    </b-collapse>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Prop, Watch } from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import { debounceTime, takeUntil } from 'rxjs/operators';
    import { merge, Subject } from 'rxjs';
    import Series from '../../../../store/models/series.model';
    import { optionsContainer } from '../../container/container';
    import { StoreService } from '../../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { SeriesSeason } from '../../../../store/models/series-season.model';
    import {
        getAvailableLanguagesForSeasonAndActivePortal,
        getSeasonsForSeries
    } from '../../../../store/selectors/series-season.selector';
    import SeriesEpisode from '../../../../store/models/series-episode.model';
    import SeriesEpisodeButton from './SeriesEpisodeButton.vue';
    import { getLastWatchedEpisode, getSeriesByKey } from '../../../../store/selectors/series.selector';
    import { getSeriesEpisodesForSeason } from '../../../../store/selectors/series-episode.selector';
    import { hasAsyncInteractionForType, isPreparingVideo } from '../../../../store/selectors/control-state.selector';
    import SeriesSeasonButton from './SeasonEpisodeButton.vue';
    import ContinueSeriesButton from './ContinueSeriesButton.vue';
    import { startEpisodeAction } from '../../../../store/actions/shared.actions';
    import {
        setSelectedLanguageAction,
        setSelectedSeasonForAppAction
    } from '../../../../store/reducers/app-control-state.reducer';
    import { AsyncInteractionType } from '../../../../store/enums/async-interaction-type.enum';
    import { LANGUAGE } from '../../../../store/enums/language.enum';
    import { LABGUAGE_FLAG_DATA_MAP } from '../../data/language-flag-data.map';
    import LanguageIcon from '../LanguageIcon.vue';
    import { getSelectedLanguage } from '../../../../store/selectors/app-control-state.selector';

    @Component({
        name: 'series-detail-view',
        components: {
            LanguageIcon,
            SeriesEpisodeButton,
            SeriesSeasonButton,
            ContinueSeriesButton,
        },
    })
    export default class SeriesDetailView extends Vue {

        private readonly seriesChanged$ = new Subject();
        private readonly seasonChanged$ = new Subject();
        private readonly takeUntil$ = new Subject();
        private readonly languageFlagMap = LABGUAGE_FLAG_DATA_MAP;

        @Prop(String)
        private seriesKey: Series['key'];

        @Prop(Boolean)
        private isExpanded: boolean;

        private store: StoreService;

        private isLoading = false;
        private isSeasonLoading = false;
        private seriesData: Series = null;
        private seasons: SeriesSeason[] = [];
        private episodes: SeriesEpisode[] = [];
        private selectedSeasonKey: string = null;
        private episodeToContinue: SeriesEpisode = null;
        private availableLanguages: LANGUAGE[];
        private selectedLanguage: LANGUAGE;

        private get isSeriesLoading(): boolean {
            return this.seasons.length === 0;
        }

        private get areEpisodesLoading(): boolean {
            return this.isSeasonLoading && !this.episodes.length && Boolean(this.selectedSeasonKey);
        }

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        @Watch('isExpanded', { immediate: true })
        public expandationChanged(isExpanded: boolean): void {
            if (isExpanded) {
                this.fetchLoadingStateFromStore();
                this.fetchSeasonLoadingStateFromStore();
                this.fetchSelectedLanguageFromStore();
            } else {
                this.takeUntil$.next();
            }
        }

        @Watch('seriesKey')
        public loadSeriesData(seriesKey: Series['key']): void {
            if (seriesKey) {
                this.seriesChanged$.next();
                this.resetData();

                this.fetchEpisodeToContinueFromStore();
                this.fetchSeriesDataFromStore(seriesKey);
                this.fetchSeasonsFromStore(seriesKey);
            }
        }

        public seasonClicked(seasonKey: SeriesSeason['key']): void {
            if (seasonKey !== this.selectedSeasonKey) {
                this.seasonChanged$.next();
                this.selectedSeasonKey = seasonKey;
                this.episodes = [];

                this.fetchSeriesEpisodesFromStore(seasonKey);
                this.fetchAvailableLanguagesFromStore(seasonKey);

                this.store.dispatch(setSelectedSeasonForAppAction(seasonKey));
            }
        }

        public episodeClicked(episodeKey: SeriesEpisode['key']): void {
            if (episodeKey) {
                this.store.dispatch(startEpisodeAction(episodeKey));
            }
        }

        public languageClicked(language: LANGUAGE): void {
            if (language !== this.selectedLanguage) {
                this.store.dispatch(setSelectedLanguageAction({ selectedLanguage: language }));
            }
        }

        private resetData(): void {
            this.seasonChanged$.next();
            this.seriesData = null;
            this.selectedSeasonKey = null;
            this.seasons = [];
            this.episodes = [];
            this.availableLanguages = [];
        }

        private async fetchEpisodeToContinueFromStore(): Promise<void> {
            this.store.selectBehaviour(getLastWatchedEpisode, this.seriesKey).pipe(
                takeUntil(merge(this.seriesChanged$, this.takeUntil$)),
            ).subscribe(episode => this.episodeToContinue = episode);
        }

        private fetchSeasonLoadingStateFromStore(): void {
            this.store.selectBehaviour(hasAsyncInteractionForType, AsyncInteractionType.PORTAL_GET_SEASON_EPISODES).pipe(
                takeUntil(this.takeUntil$),
                debounceTime(100),
            ).subscribe(isLoading => this.isSeasonLoading = isLoading);
        }

        private fetchLoadingStateFromStore(): void {
            this.store.selectBehaviour(isPreparingVideo).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isLoading => this.isLoading = isLoading);
        }

        private fetchSeriesDataFromStore(seriesKey: Series['key']): void {
            const takeUntil$ = merge(this.seriesChanged$, this.takeUntil$);
            this.store.selectBehaviour(getSeriesByKey, seriesKey).pipe(
                takeUntil(takeUntil$),
            ).subscribe(series => {
                this.seriesData = series;
            });
        }

        private fetchSeasonsFromStore(seriesKey: Series['key']): void {
            const takeUntil$ = merge(this.seriesChanged$, this.takeUntil$);
            this.store.selectBehaviour(getSeasonsForSeries, seriesKey).pipe(
                takeUntil(takeUntil$),
            ).subscribe(seasons => {
                this.seasons = seasons;
            });
        }

        private fetchSeriesEpisodesFromStore(seriesSeasonKey: SeriesSeason['key']): void {
            const takeUntil$ = merge(this.seasonChanged$, this.seriesChanged$, this.takeUntil$);
            this.store.selectBehaviour(getSeriesEpisodesForSeason, seriesSeasonKey).pipe(
                takeUntil(takeUntil$),
            ).subscribe(episodes => {
                this.episodes = episodes;
            });
        }

        private fetchAvailableLanguagesFromStore(seriesSeasonKey: SeriesSeason['key']): void {
            const takeUntil$ = merge(this.seasonChanged$, this.seriesChanged$, this.takeUntil$);
            this.store.selectBehaviour(getAvailableLanguagesForSeasonAndActivePortal, seriesSeasonKey).pipe(
                takeUntil(takeUntil$),
            ).subscribe(languages => this.availableLanguages = languages);
        }

        private fetchSelectedLanguageFromStore(): void {
            this.store.selectBehaviour(getSelectedLanguage).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(language => this.selectedLanguage = language);
        }
    }
</script>

<style lang="scss" scoped>

    @import "src/styles/variables";

    $accordionHeight: 300px;

    .flex-center {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .flex-container {
        display: flex;
    }

    .content-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .full-height {
        height: 100%;
    }

    .accordion-content {
        min-height: $accordionHeight;
        background-color: $black-color;
        color: white;
        border-radius: 3px;
    }

    .cover {
        width: 210px;
        align-items: center;
        display: flex;

        img {
            max-width: 210px;
            height: $accordionHeight;
        }
    }

    .content-description {
        flex: 1;
        width: 100%;
        min-height: 200px;
    }

    .card-body {
        padding-top: 4px;
        padding-bottom: 4px;
    }

    .content-series-items {
        display: flex;
        overflow: hidden;
        flex-wrap: wrap;

        span {
        }
    }

    .white-tile {
        height: 40px;
        color: black;
        background-color: white;
    }
</style>
