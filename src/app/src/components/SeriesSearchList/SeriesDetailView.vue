<template>
    <b-collapse class="mt-1 mb-2 px-0" v-model="isExpanded">
        <div class="accordion-content full-height">
            <div v-if="!isSeriesLoading" class="full-height flex-container">
                <div class="content-container">
                    <div class="content-description p-3">{{seriesData.description}}</div>
                    <div class="content-series-items mb-3 ml-4">
                        <div class="px-3 mt-1 flex-center white-tile">
                            <b>Staffeln:</b>
                        </div>
                        <div class="mt-1 series-item flex-center white-tile"
                             v-for="season in seasons"
                             @click="seasonClicked(season.key)"
                             :class="{selected: isSeasonSelected(season.key), disabled: areEpisodesLoading}"
                             v-bind:key="season.key">
                            <div v-if="isSeasonLoading(season.key)" class="spinner-border tile-spinner" role="status">
                                <span class="sr-only"></span>
                            </div>
                            <div v-else>
                                {{season.seasonNumber}}
                            </div>
                        </div>
                    </div>
                    <div class="content-series-items mb-3 ml-4" v-if="episodes.length">
                        <span class="px-3 mt-1 flex-center white-tile">
                            <b>Episoden:</b>
                        </span>
                        <series-episode-button
                                v-for="seriesEpisode in episodes" :key="seriesEpisode.key"
                                :episode-info="seriesEpisode"
                                :is-blocked="isEpisodeLoading"
                                @click="episodeClicked(seriesEpisode)"/>
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
            <div v-else class="flex-center full-height">
                <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only"></span>
                </div>
                <span>Serie wird geladen...</span>
            </div>
        </div>
    </b-collapse>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Prop, Watch } from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import { takeUntil } from 'rxjs/operators';
    import { merge, Subject } from 'rxjs';
    import { fromPromise } from 'rxjs/internal-compatibility';
    import Series from '../../../../store/models/series.model';
    import { optionsContainer } from '../../container/container';
    import { StoreService } from '../../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { MessageService } from '../../../../shared/services/message.service';
    import { SeriesSeason } from '../../../../store/models/series-season.model';
    import { getSeasonsForSeries } from '../../../../store/selectors/series-season.selector';
    import {
        createSeriesSeasonSelectedInAppMessage,
        createSeriesSelectedInAppMessage,
        createStartEpisodeMessage,
    } from '../../../../browserMessages/messages/background.messages';
    import { PORTALS } from '../../../../store/enums/portals.enum';
    import SeriesEpisode from '../../../../store/models/series-episode.model';
    import SeriesEpisodeButton from './SeriesEpisodeButton.vue';
    import { getSeriesByKey } from '../../../../store/selectors/series.selector';
    import { getSeriesEpisodesForSeason } from '../../../../store/selectors/series-episode.selector';

    @Component({
        name: 'series-detail-view',
        components: {
            SeriesEpisodeButton,
        },
    })
    export default class SeriesDetailView extends Vue {

        private readonly seriesChanged$ = new Subject();
        private readonly seasonChanged$ = new Subject();
        private readonly takeUntil$ = new Subject();

        @Prop(String)
        private seriesKey: Series['key'];

        @Prop(Boolean)
        private isExpanded: boolean;

        @Prop(String)
        private selectedProtal: PORTALS;

        private messageService: MessageService;
        private store: StoreService;

        private isLoading = true;
        private seriesData: Series = null;
        private seasons: SeriesSeason[] = [];
        private episodes: SeriesEpisode[] = [];
        private selectedSeasonKey: string = null;
        private isEpisodeLoading = false;

        private get isSeriesLoading(): boolean {
            return this.isLoading
                && !(Boolean(this.seriesData?.description)
                    && Boolean(this.seriesData?.posterHref));
        }

        private get areEpisodesLoading(): boolean {
            return this.isLoading && !this.episodes.length && Boolean(this.selectedSeasonKey);
        }

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        @Watch('seriesKey')
        public async loadSeriesData(seriesKey: Series['key']): Promise<void> {
            if (seriesKey) {
                this.resetData();
                this.isLoading = true;

                this.fetchSeriesDataFromStore(seriesKey);
                this.fetchSeasonsFromStore(seriesKey);

                const message = createSeriesSelectedInAppMessage(seriesKey, this.selectedProtal);
                fromPromise(this.messageService.sendMessageToBackground(message)).pipe(
                    takeUntil(merge(this.seriesChanged$, this.takeUntil$)),
                ).subscribe(() => {
                    this.isLoading = false;
                });
            }
        }

        public async seasonClicked(seasonKey: SeriesSeason['key']): Promise<void> {
            if (seasonKey !== this.selectedSeasonKey) {
                this.isLoading = true;
                this.seasonChanged$.next();
                this.selectedSeasonKey = seasonKey;
                this.episodes = [];

                this.fetchSeriesEpisodesFromStore(seasonKey);

                const message = createSeriesSeasonSelectedInAppMessage(seasonKey, this.selectedProtal);
                fromPromise(this.messageService.sendMessageToBackground(message)).pipe(
                    takeUntil(merge(this.seriesChanged$, this.takeUntil$)),
                ).subscribe(() => {
                    this.isLoading = null;
                });
            }
        }

        public async episodeClicked(episode: SeriesEpisode): Promise<void> {
            if (this.isEpisodeLoading) {
                return;
            }
            this.isEpisodeLoading = true;

            await this.messageService.sendMessageToBackground(createStartEpisodeMessage(episode.key, this.selectedProtal));

            this.isEpisodeLoading = true;
        }

        private isSeasonSelected(seasonKey: SeriesSeason['key']): boolean {
            return this.selectedSeasonKey === seasonKey;
        }

        private isSeasonLoading(seasonKey: SeriesSeason['key']): boolean {
            return this.isLoading
                && this.selectedSeasonKey === seasonKey
                && !this.episodes.length;
        }

        private resetData(): void {
            this.seasonChanged$.next();
            this.seriesData = null;
            this.selectedSeasonKey = null;
            this.isEpisodeLoading = false;
            this.isLoading = false;
            this.seasons = [];
            this.episodes = [];
        }

        private fetchSeriesDataFromStore(seriesKey: Series['key']): void {
            this.store.selectBehaviour(getSeriesByKey, seriesKey).pipe(
                takeUntil(merge(this.seriesChanged$, this.takeUntil$)),
            ).subscribe(series => this.seriesData = series);
        }

        private fetchSeasonsFromStore(seriesKey: Series['key']): void {
            this.store.selectBehaviour(getSeasonsForSeries, seriesKey).pipe(
                takeUntil(merge(this.seriesChanged$, this.takeUntil$)),
            ).subscribe(seasons => this.seasons = seasons);
        }

        private fetchSeriesEpisodesFromStore(seriesSeasonKey: SeriesSeason['key']): void {
            this.store.selectBehaviour(getSeriesEpisodesForSeason, seriesSeasonKey).pipe(
                takeUntil(merge(this.seasonChanged$, this.seriesChanged$, this.takeUntil$)),
            ).subscribe(episodes => this.episodes = episodes);
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
        align-items: center;
        display: flex;

        img {
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

    .series-item {
        cursor: pointer;

        &:hover, &.selected {
            background-color: $primary-color;
        }

        &.disabled {
            cursor: not-allowed;
        }

        min-width: 35px;
    }

    .tile-spinner {
        height: 18px;
        width: 18px;
    }

</style>
