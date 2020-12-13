<template>
    <b-modal ref="modalRef"
             modal-class="video-modal"
             dialog-class="modal-width"
             body-class="p-0"
             hide-footer
             hide-header
             title="Using Component Methods">
        <div v-if="series" class="modal-container">
            <div class="relative h-80">
                <div v-if="false" class="absolute">
                    <youtube :video-id="youtubeUrl" player-width="900" @ended="onVideoFinished"/>
                </div>
                <div v-else class="w-full absolute">
                    <img :src="series.backgroundHref" class="w-full">
                </div>
                <div class="absolute bottom-5 left-5">
                    <h1>{{series.titles[activeLanguage]}}</h1>
                </div>
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
    import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';
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
    import { Hoster } from '../../../../../store/enums/hoster.enum';
    import { LANGUAGE } from '../../../../../store/enums/language.enum';
    import { getDefaultLanguage } from '../../../../../store/selectors/options.selector';

    @Component({
        name: 'series-modal',
    })
    export default class SeriesModal extends Vue {

        private readonly seriesChanged$ = new Subject();
        private readonly takeUntil$ = new Subject();

        private series: Series = null;
        private seasons: SeriesSeason[] = [];
        private episodes: SeriesEpisode[] = [];
        private selectedSeason: SeriesSeason['key'] = null;
        private activeLanguage: LANGUAGE = LANGUAGE.ENGLISH;

        private videoFinished = false;

        private get youtubeUrl(): string {
            const id = this.series?.previewVideos[Hoster.YOUTUBE];
            if (id) {
                const config = '?autoplay=1&controls=1&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0';
                // return `https://www.youtube.com/embed/${id}${config}`;
                return `${id}${config}`;
            }
            return '';
        }

        private get showVideo(): boolean {
            return Boolean(this.series?.previewVideos[Hoster.YOUTUBE]) && !this.videoFinished;
        }

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
                switchMap(selectedSeason => this.store.selectBehaviour(getSeriesEpisodesForSeason, selectedSeason))
            ).subscribe(episodes => this.episodes = episodes);
        }

        public onVideoFinished(): void {
            this.videoFinished = true;
        }

        private reset(): void {
            this.seasons = [];
            this.episodes = [];
            this.selectedSeason = null;
            this.series = null;
            this.videoFinished = false;
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

    .video-overlay {
        background: linear-gradient(to top, #181818, transparent 50%);
    }
</style>
