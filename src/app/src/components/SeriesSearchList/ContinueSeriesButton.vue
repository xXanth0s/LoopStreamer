<template>
    <div v-if="seriesEpisode">
        <b-button @click="continueEpisode" block class="float-right mb-2" variant="primary">
            <span v-if="isLoading">
                <div class="spinner-border" role="status" style="width: 1rem; height: 1rem;">
                    <span class="sr-only"></span>
                </div>
            </span>
            <span v-else>
                {{buttonText}}
            </span>
        </b-button>
        <div>
            <b-progress :max="100" :value="progress" class="w-full h-1" variant="info">
            </b-progress>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop, Watch } from 'vue-property-decorator';
    import { merge, Subject } from 'rxjs';
    import { takeUntil } from 'rxjs/operators';
    import SeriesEpisode from '../../../../store/models/series-episode.model';
    import { MessageService } from '../../../../shared/services/message.service';
    import { optionsContainer } from '../../container/container';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { createContinueSeriesMessage } from '../../../../browserMessages/messages/background.messages';
    import { getProgressForEpisode, getSeriesEpisodeTitle } from '../../../../store/utils/series.utils';
    import { StoreService } from '../../../../shared/services/store.service';
    import { isPreparingVideo } from '../../../../store/selectors/control-state.selector';
    import { getSeriesEpisodeByKey } from '../../../../store/selectors/series-episode.selector';

    @Component({
        name: 'continue-series-button',
    })
    export default class ContinueSeriesButton extends Vue {

        @Prop(String)
        public seriesEpisodeKey: SeriesEpisode['key'];

        private readonly takeUntil$ = new Subject();
        private readonly episodeChanged$ = new Subject();

        private messageService: MessageService;
        private store: StoreService;

        private seriesEpisode: SeriesEpisode = null;
        private isLoading = false;

        public get buttonText(): string {
            return `${getSeriesEpisodeTitle(this.seriesEpisode)} Fortsetzen`;
        }

        public get progress(): number {
            return getProgressForEpisode(this.seriesEpisode);
        }

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }

        public mounted(): void {
            this.fetchLoadingStateFromStore();
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        public continueEpisode(): void {
            this.messageService.sendMessageToBackground(createContinueSeriesMessage(this.seriesEpisode.seriesKey));
        }

        @Watch('seriesEpisodeKey', { immediate: true })
        private episodeChanged(): void {
            this.episodeChanged$.next();
            this.fetchSeriesEpisodeFromStore();
        }

        private fetchLoadingStateFromStore(): void {
            this.store.selectBehaviour(isPreparingVideo).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isLoading => this.isLoading = isLoading);
        }

        private fetchSeriesEpisodeFromStore(): void {
            this.store.selectBehaviour(getSeriesEpisodeByKey, this.seriesEpisodeKey).pipe(
                takeUntil(merge(this.takeUntil$, this.episodeChanged$)),
            ).subscribe(seriesEpisode => {
                this.seriesEpisode = seriesEpisode;
                console.log(this.seriesEpisode);
                this.$forceUpdate();
            });
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
