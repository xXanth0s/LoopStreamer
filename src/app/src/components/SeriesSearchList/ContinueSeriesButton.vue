<template>
    <div>
        <b-button block
                  class="float-right mb-2"
                  variant="primary"
                  @click="continueEpisode"
                  :disabled="!hasValidLinks" :title="title">
            <span v-if="isLoading">
                <div class="spinner-border" role="status" style="width: 1rem; height: 1rem;">
                    <span classeries-modal-descriptions="sr-only"></span>
                </div>
            </span>
            <span v-else>
                {{buttonText}}
            </span>
        </b-button>
        <div v-if="hasValidLinks">
            <b-progress :max="100" :value="progress" class="w-full h-1" variant="info">
            </b-progress>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';
    import { Subject } from 'rxjs';
    import { takeUntil } from 'rxjs/operators';
    import SeriesEpisode from '../../../../store/models/series-episode.model';
    import { MessageService } from '../../../../shared/services/message.service';
    import { optionsContainer } from '../../container/container';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { getProgressForEpisode, getSeriesEpisodeTitle } from '../../../../store/utils/series.utils';
    import { StoreService } from '../../../../shared/services/store.service';
    import Series from '../../../../store/models/series.model';
    import { getLastWatchedOrFirstEpisodeForActiveSeason } from '../../../../store/selectors/series.selector';
    import { isLoadingSeason, isPreparingVideo } from '../../../../store/selectors/async-interaction.selector';
    import { startEpisodeAction } from '../../../../store/actions/shared.actions';

    @Component({
        name: 'continue-series-button',
    })
    export default class ContinueSeriesButton extends Vue {
        @Prop(String)
        public seriesKey: Series['key'];

        private readonly takeUntil$ = new Subject();

        private messageService: MessageService;
        private store: StoreService;

        private seriesEpisode: SeriesEpisode = null;
        private isVideoLoading = false;
        private isSeasonLoading = false;

        public get hasValidLinks(): boolean {
            return Boolean(this.seriesEpisode?.portalLinks.length);
        }

        public get buttonText(): string {
            const { timestamp, episodeNumber, season } = this.seriesEpisode;
            if (!this.hasValidLinks) {
                return 'Keine Streams gefunden';
            }

            if (+season === 1 && episodeNumber === 1 && !timestamp) {
                return 'Serie abspielen';
            }

            return `${getSeriesEpisodeTitle(this.seriesEpisode)} ${timestamp ? 'fortsetzen' : 'starten'}`;
        }

        public get isLoading(): boolean {
            return this.isVideoLoading || (this.isSeasonLoading && !this.hasValidLinks);
        }

        public get progress(): number {
            return getProgressForEpisode(this.seriesEpisode);
        }

        public get title(): string {
            if (!this.hasValidLinks) {
                return 'Es wurden keine validen Streams gefunden';
            }

            return '';
        }

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }

        public mounted(): void {
            this.fetchLastWatchedOrFirstEpisode();
            this.fetchSeasonLoadingStateFromStore();
            this.fetchVideoLoadingStateFromStore();
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        public continueEpisode(): void {
            this.store.dispatch(startEpisodeAction({ episodeKey: this.seriesEpisode.key }));
        }

        private fetchSeasonLoadingStateFromStore(): void {
            this.store.selectBehaviour(isLoadingSeason).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isLoading => this.isSeasonLoading = isLoading);
        }

        private fetchVideoLoadingStateFromStore(): void {
            this.store.selectBehaviour(isPreparingVideo).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isLoading => this.isVideoLoading = isLoading);
        }

        private fetchLastWatchedOrFirstEpisode(): void {
            this.store.selectBehaviour(getLastWatchedOrFirstEpisodeForActiveSeason, this.seriesKey).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(episode => this.seriesEpisode = episode);
        }
    }
</script>

<style lang="scss" scoped>
    @import "src/styles/variables";

    .h-1 {
        height: 0.15rem !important;
    }

    .progress-bar {
        background-color: $light-blue-color !important;
    }
</style>
