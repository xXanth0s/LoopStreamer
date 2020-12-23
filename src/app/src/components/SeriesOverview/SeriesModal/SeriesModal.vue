<template>
    <b-modal ref="modalRef"
             modal-class="video-modal"
             dialog-class="modal-width"
             body-class="p-0"
             hide-footer
             hide-header
             title="Using Component Methods">
        <div class="modal-container bg-gray-900 text-white relative">
            <div v-if="series">
                <series-modal-header
                        class="font-mono ls-modal-header"
                        :series="series"
                        :language="activeLanguage"
                        @close-modal="closeModal"/>

                <div class="px-4">
                    <series-modal-description class="mt-4"
                                              :series="series"
                                              :language="activeLanguage"/>

                    <seasons-list class="mt-4" :seasons="seasons" @seasonClicked="seasonSelected"/>
                    <hr>
                    <series-episode-list :episodes="episodes" :language="activeLanguage"/>
                </div>
                <div v-if="similarSeriesCollection" class="px-4 pt-4 relative">
                    <series-carousel class="text-left"
                                     :fixed-slides-count="5"
                                     :language="activeLanguage"
                                     :seriesCollection="similarSeriesCollection"
                                     @seriesClicked="similarSeriesSelected"/>
                </div>
            </div>
            <div v-else class="absolute flex flex-column items-center justify-content-center w-100 h-100">
                <div class="spinner-border" role="status" style="width: 3rem; height: 3rem;">
                    <span class="sr-only"></span>
                </div>
                <span>Serie wird geladen...</span>
            </div>
        </div>
    </b-modal>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Emit, Inject } from 'vue-property-decorator';
    import { BvComponent } from 'bootstrap-vue';
    import { Subject } from 'rxjs';
    import { filter, switchMap, takeUntil, tap, } from 'rxjs/operators';
    import Series from '../../../../../store/models/series.model';
    import { SeriesSeason } from '../../../../../store/models/series-season.model';
    import { SHARED_TYPES } from '../../../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../../../shared/services/store.service';
    import { MessageService } from '../../../../../shared/services/message.service';
    import { getSeriesByKey } from '../../../../../store/selectors/series.selector';
    import { getSeasonsForSeries } from '../../../../../store/selectors/series-season.selector';
    import {
        getSelectedSeasonKey,
        getSeriesCollection,
    } from '../../../../../store/selectors/app-control-state.selector';
    import SeriesEpisode from '../../../../../store/models/series-episode.model';
    import { getSeriesEpisodesForSeason } from '../../../../../store/selectors/series-episode.selector';
    import { LANGUAGE } from '../../../../../store/enums/language.enum';
    import { getDefaultLanguage } from '../../../../../store/selectors/options.selector';
    import SeriesModalHeader from './SeriesModalHeader.vue';
    import SeriesModalDescription from './SeriesModalDescription.vue';
    import SeriesListRow from '../../SeriesSearchList/SeriesListRow.vue';
    import SeasonsList from './SeasonsList.vue';
    import SeriesEpisodeTile from './EpisodeTile/SeriesEpisodeTile.vue';
    import SeriesEpisodeList from './SeriesEpisodeList.vue';
    import { setSelectedSeasonForAppAction } from '../../../../../store/reducers/app-control-state.reducer';
    import { CollectionKey } from '../../../../../store/enums/collection-key.enum';
    import { NamedCollection } from '../../../../../store/models/collection.model';
    import { SeriesMetaInfo } from '../../../../../store/models/series-meta-info.model';
    import SeriesCarousel from '../SeriesCarousel.vue';

    @Component({
        name: 'series-modal',
        components: {
            SeriesCarousel,
            SeriesEpisodeList,
            SeriesEpisodeTile,
            SeasonsList,
            SeriesListRow,
            SeriesModalDescription,
            SeriesModalHeader,
        },
    })
    export default class SeriesModal extends Vue {
        private readonly seriesChanged$ = new Subject();
        private readonly takeUntil$ = new Subject();

        public series: Series = null;
        public seasons: SeriesSeason[] = [];
        public episodes: SeriesEpisode[] = [];
        public selectedSeason: SeriesSeason['key'] = null;
        public activeLanguage: LANGUAGE = LANGUAGE.ENGLISH;
        public similarSeriesCollection: NamedCollection<SeriesMetaInfo> = null;

        $refs!: {
            modalRef: BvComponent;
        };

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        @Inject(SHARED_TYPES.MessageService)
        private messageService: MessageService;

        public mounted(): void {
            this.activeLanguage = this.store.selectSync(getDefaultLanguage);
        }

        public openModal(seriesKey: Series['key']): void {
            this.reset();
            this.$refs.modalRef.show();
            this.loadSeriesData(seriesKey);
            this.loadSeriesSeason(seriesKey);
            this.loadActiveSeason();
            this.loadSimilarSeriesData();
            this.scrollToTop();
        }

        public closeModal(): void {
            this.$refs.modalRef.hide();
            this.reset();
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
            this.store.selectBehaviour(getSelectedSeasonKey).pipe(
                takeUntil(this.takeUntil$),
                tap(selectedSeason => {
                    this.selectedSeason = selectedSeason;
                    this.episodes = [];
                }),
                filter<SeriesSeason['key']>(Boolean),
                switchMap(selectedSeason => this.store.selectBehaviour(getSeriesEpisodesForSeason, selectedSeason)),
            ).subscribe(episodes => this.episodes = episodes);
        }

        public loadSimilarSeriesData(): void {
            this.store.selectBehaviour(getSeriesCollection, CollectionKey.SIMILAR_SERIES_MODAL).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(collection => this.similarSeriesCollection = collection);
        }

        public seasonSelected(seasonKey: SeriesSeason['key']): void {
            this.store.dispatch(setSelectedSeasonForAppAction(seasonKey));
        }

        @Emit('similarSeriesSelected')
        public similarSeriesSelected(seriesKey: Series['key']): Series['key'] {
            return seriesKey;
        }

        private reset(): void {
            this.seasons = [];
            this.episodes = [];
            this.selectedSeason = null;
            this.series = null;
        }

        private scrollToTop(): void {
            this.$scrollTo('.ls-modal-header', {
                container: '.modal',
                easing: 'ease',
                duration: 1000,
            });
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
