<template>
    <button-tile
            :is-active="episodeInfo.key === activeEpisodeKey"
            :is-disabled="isAnyEpisodeLoading"
            :is-unavailable="!hasValidLinks"
            :title="title"
            :progress="progress"
            :is-loading="episodeInfo.key === activeEpisodeKey && isAnyEpisodeLoading"
            @clicked="clicked">
        {{episodeInfo.episodeNumber}}
    </button-tile>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Emit, Prop } from 'vue-property-decorator';
    import { Subject } from 'rxjs';
    import { takeUntil } from 'rxjs/operators';
    import SeriesEpisode from '../../../../store/models/series-episode.model';
    import { StoreService } from '../../../../shared/services/store.service';
    import { optionsContainer } from '../../container/container';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { getActiveEpisode, isPreparingVideo } from '../../../../store/selectors/control-state.selector';
    import ButtonTile from '../ButtonTile.vue';
    import { getProgressForEpisode } from '../../../../store/utils/series.utils';
    import { PORTALS } from '../../../../store/enums/portals.enum';
    import { getActivePortalOnAppOrSeries } from '../../../../store/selectors/app-control-state.selector';
    import { hasEpisodeLinksForSelectedLanguageAndPortal } from '../../../../store/selectors/series-episode.selector';

    @Component({
        name: 'series-episode-button',
        components: {
            ButtonTile,
        },
    })
    export default class SeriesEpisodeButton extends Vue {

        private readonly takeUntil$ = new Subject();

        @Prop(Object)
        private episodeInfo: SeriesEpisode;

        private store: StoreService;
        private isAnyEpisodeLoading = false;
        private hasValidLinks = false;
        private activeEpisodeKey = '';
        private activePortal: PORTALS;

        public get progress(): number {
            return getProgressForEpisode(this.episodeInfo);
        }

        public get title(): string {
            if (!this.hasValidLinks) {
                return 'Für die ausgwählte Sprache wurde kein verfügbarer Stream gefunden.';
            }
            if (this.isAnyEpisodeLoading) {
                return 'Es wird bereits eine Episode vorbereitet.';
            }
            return '';
        }

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
        }

        public mounted(): void {
            this.fetchEpisodeLoadingStateFromStore();
            this.fetchEpisoeLinkStatusFromStore();
            this.setSelectedEpisode();

            this.activePortal = this.store.selectSync(getActivePortalOnAppOrSeries, this.episodeInfo.key);
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        @Emit('clicked')
        private clicked(): SeriesEpisode['key'] {
            if (!this.isAnyEpisodeLoading) {
                return this.episodeInfo.key;
            }
            return null;
        }

        private setSelectedEpisode(): void {
            this.store.selectBehaviour(getActiveEpisode).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(activeEpisode => this.activeEpisodeKey = activeEpisode);
        }

        private fetchEpisodeLoadingStateFromStore(): void {
            this.store.selectBehaviour(isPreparingVideo).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isLoading => {
                this.isAnyEpisodeLoading = isLoading;
            });
        }

        private fetchEpisoeLinkStatusFromStore(): void {
            this.store.selectBehaviour(hasEpisodeLinksForSelectedLanguageAndPortal, this.episodeInfo.key).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(hasEpisodeLinks => this.hasValidLinks = hasEpisodeLinks);
        }
    }
</script>
