<template>
    <b-modal ref="modalRef"
             modal-class="video-modal"
             dialog-class="modal-width"
             body-class="p-0"
             hide-footer
             hide-header
             title="Using Component Methods">
        <div class="modal-container bg-gray-900 text-white pb-5 relative">
            <div v-if="series">
                <series-modal-header
                        class="font-mono"
                        :series="series"
                        :language="activeLanguage"
                        @close-modal="closeModal"/>

                <div class="px-4 mt-4">
                    <series-modal-description
                            :series="series"
                            :language="activeLanguage"/>

                    <seasons-list class="mt-4" :seasons="seasons" @seasonClicked="seasonSelected"/>
                    <hr>
                    <series-episode-list :episodes="episodes" :language="activeLanguage"/>
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
    import { Inject } from 'vue-property-decorator';
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
    import { getSelectedSeason } from '../../../../../store/selectors/app-control-state.selector';
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

    @Component({
        name: 'series-modal',
        components: {
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

        private series: Series = null;
        private seasons: SeriesSeason[] = [];
        private episodes: SeriesEpisode[] = [];
        private selectedSeason: SeriesSeason['key'] = null;
        private activeLanguage: LANGUAGE = LANGUAGE.ENGLISH;

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
            this.store.selectBehaviour(getSelectedSeason).pipe(
                takeUntil(this.takeUntil$),
                tap(selectedSeason => {
                    this.selectedSeason = selectedSeason;
                    this.episodes = [];
                }),
                filter<SeriesSeason['key']>(Boolean),
                switchMap(selectedSeason => this.store.selectBehaviour(getSeriesEpisodesForSeason, selectedSeason)),
            ).subscribe(episodes => this.episodes = episodes);
        }

        public seasonSelected(seasonKey: SeriesSeason['key']): void {
            this.store.dispatch(setSelectedSeasonForAppAction(seasonKey));
        }

        private reset(): void {
            this.seasons = [];
            this.episodes = [];
            this.selectedSeason = null;
            this.series = null;
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
