<template>
    <b-modal ref="modalRef"
             modal-class="video-modal"
             dialog-class="modal-width"
             body-class="p-0"
             hide-footer
             hide-header
             title="Using Component Methods">
        <div class="modal-container bg-gray-900 text-white relative">
            <div v-if="showModalContent" :key="series.key">
                <series-modal-header
                        class="font-mono ls-modal-header"
                        :series="series"
                        :key="series.key"
                        :language="activeLanguage"
                        :show-settings="isSeriesConfiguable"
                        @settings-clicked="toggleSettings"
                        @close-modal="closeModal"/>

                <div class="px-4">
                    <series-modal-description class="mt-4"
                                              :series="series"
                                              :key="series.key"
                                              :language="activeLanguage"/>

                    <b-collapse v-if="isSeriesConfiguable" v-model="areSettingsOpen" >
                        <series-settings :series="series" :season="selectedSeason" class="mt-5"/>
                    </b-collapse>
                    <seasons-list class="mt-4"
                                  :seasons="seasons"
                                  :key="seasons[0].key"
                                  @seasonClicked="seasonSelected"/>
                    <hr>
                    <series-episode-list v-if="episodes.length" :key="episodes[0].key" :episodes="episodes" :language="activeLanguage"/>
                </div>
                <div v-if="similarSeriesCollection" class="px-4 pt-4 relative">
                    <series-carousel class="text-left"
                                     :fixed-slides-count="5"
                                     :key="series.key"
                                     :language="activeLanguage"
                                     :seriesCollection="similarSeriesCollection"
                                     @seriesClicked="similarSeriesSelected"/>
                </div>
            </div>
            <spinner v-else class="w-100 h-100 absolute" text="Serie wird geladen..."/>
        </div>
    </b-modal>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Emit, Inject } from 'vue-property-decorator';
    import { BvComponent } from 'bootstrap-vue';
    import { Subject } from 'rxjs';
    import {
      filter, switchMap, takeUntil, tap,
    } from 'rxjs/operators';
    import { Series } from '../../../../../store/models/series.model';
    import { SeriesSeason } from '../../../../../store/models/series-season.model';
    import { SHARED_TYPES } from '../../../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../../../shared/services/store.service';
    import { getSeriesByKey } from '../../../../../store/selectors/series.selector';
    import { getSeasonsForSeries } from '../../../../../store/selectors/series-season.selector';
    import {
      getCollectionsForTypes,
      getSelectedSeason,
    } from '../../../../../store/selectors/app-control-state.selector';
    import { SeriesEpisode } from '../../../../../store/models/series-episode.model';
    import { getSeriesEpisodesForSeason } from '../../../../../store/selectors/series-episode.selector';
    import { LANGUAGE } from '../../../../../store/enums/language.enum';
    import { getDefaultLanguage } from '../../../../../store/selectors/options.selector';
    import SeriesModalHeader from './SeriesModalHeader.vue';
    import SeriesModalDescription from './SeriesModalDescription.vue';
    import SeasonsList from './SeasonsList.vue';
    import SeriesEpisodeTile from './EpisodeTile/SeriesEpisodeTile.vue';
    import SeriesEpisodeList from './SeriesEpisodeList.vue';
    import { setSelectedSeasonForAppAction } from '../../../../../store/reducers/app-control-state.reducer';
    import { CollectionType } from '../../../../../store/enums/collection-key.enum';
    import { NamedCollection } from '../../../../../store/models/collection.model';
    import { SeriesMetaInfo } from '../../../../../store/models/series-meta-info.model';
    import SeriesCarousel from '../SeriesCarousel.vue';
    import Spinner from '../../Shared/Spinner.vue';
    import SeriesSettings from './SeriesSettings.vue';

    @Component({
        name: 'series-modal',
        components: {
            SeriesSettings,
            SeriesCarousel,
            SeriesEpisodeList,
            SeriesEpisodeTile,
            SeasonsList,
            SeriesModalDescription,
            SeriesModalHeader,
            Spinner,
        },
    })
    export default class SeriesModal extends Vue {
        private readonly seriesChanged$ = new Subject();
        private readonly takeUntil$ = new Subject();

        public series: Series = null;
        public seasons: SeriesSeason[] = [];
        public episodes: SeriesEpisode[] = [];
        public selectedSeason: SeriesSeason = null;
        public activeLanguage: LANGUAGE = LANGUAGE.ENGLISH;
        public similarSeriesCollection: NamedCollection<SeriesMetaInfo> = null;
        public areSettingsOpen = false;

        $refs!: {
            modalRef: BvComponent;
        };

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        public get showModalContent(): boolean {
            return Boolean(this.series)
                && Boolean(this.selectedSeason)
                && this.series.key === this.selectedSeason.seriesKey;
        }

        public get isSeriesConfiguable(): boolean {
            return Boolean(this.series.lastEpisodeWatched);
        }

        public mounted(): void {
            this.activeLanguage = this.store.selectSync(getDefaultLanguage);
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        public openModal(seriesKey: Series['key']): void {
            this.reset();
            this.$refs.modalRef.show();
            this.loadSeriesData(seriesKey);
            this.loadSeriesSeason(seriesKey);
            this.loadActiveSeason();
            this.loadSimilarSeriesData();
        }

        public closeModal(): void {
            this.$refs.modalRef.hide();
            this.reset();
        }

        public toggleSettings(): void {
            this.areSettingsOpen = !this.areSettingsOpen;
        }

        public loadSeriesData(seriesKey: Series['key']): void {
            this.store.selectBehaviour(getSeriesByKey, seriesKey).pipe(
                takeUntil(this.seriesChanged$),
            ).subscribe(series => this.series = series);
        }

        public loadSeriesSeason(seriesKey: Series['key']): void {
            this.store.selectBehaviour(getSeasonsForSeries, seriesKey).pipe(
                takeUntil(this.seriesChanged$),
            ).subscribe(seasons => this.seasons = seasons);
        }

        public loadActiveSeason(): void {
            this.store.selectBehaviour(getSelectedSeason).pipe(
                takeUntil(this.takeUntil$),
                tap(selectedSeason => {
                    this.selectedSeason = selectedSeason;
                    this.episodes = [];
                }),
                filter<SeriesSeason>(Boolean),
                switchMap(selectedSeason => this.store.selectBehaviour(getSeriesEpisodesForSeason, selectedSeason.key)),
            ).subscribe(episodes => this.episodes = episodes);
        }

        public loadSimilarSeriesData(): void {
            this.store.selectBehaviour(getCollectionsForTypes, [ CollectionType.SIMILAR_SERIES_MODAL ]).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(collections => this.similarSeriesCollection = collections[0] || null);
        }

        public seasonSelected(seasonKey: SeriesSeason['key']): void {
            this.store.dispatch(setSelectedSeasonForAppAction(seasonKey));
        }

        @Emit('similarSeriesSelected')
        public similarSeriesSelected(seriesKey: Series['key']): Series['key'] {
            return seriesKey;
        }

        private reset(): void {
            this.takeUntil$.next();
            this.seasons = [];
            this.episodes = [];
            this.selectedSeason = null;
            this.series = null;
            this.areSettingsOpen = false;
        }
    }
</script>

<style lang="scss">

    $modal-width: 900px;
    .modal-width {

        width: $modal-width !important;
        max-width: $modal-width !important;
    }

    .video-modal {
        .modal-content {
            width: $modal-width !important;
        }
    }
</style>

<style lang="scss" scoped>

    .modal-container {
        min-height: 500px;
    }
</style>
