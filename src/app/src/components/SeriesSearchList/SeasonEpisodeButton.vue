<template>

    <button-tile
            :is-active="seasonInfo.key === activeSeasonKey"
            :is-disabled="isSeasonLoading"
            :progress="progress"
            :is-loading="seasonInfo.key === activeSeasonKey && isSeasonLoading"
            @clicked="clicked">
        {{seasonInfo.seasonNumber}}
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
    import { hasAsyncInteractionForType } from '../../../../store/selectors/control-state.selector';
    import { AsyncInteractionType } from '../../../../store/enums/async-interaction-type.enum';
    import { SeriesSeason } from '../../../../store/models/series-season.model';
    import ButtonTile from '../ButtonTile.vue';
    import { getSeriesEpisodesForSeason } from '../../../../store/selectors/series-episode.selector';
    import { hasSeasonAlreadyPlayedEpisodes } from '../../../../store/selectors/series-season.selector';

    @Component({
        name: 'series-season-button',
        components: { ButtonTile },
    })
    export default class SeriesSeasonButton extends Vue {

        private readonly takeUntil$ = new Subject();

        @Prop(Object)
        private seasonInfo: SeriesSeason;

        @Prop(String)
        private activeSeasonKey: string;

        private store: StoreService;
        private isSeasonLoading = false;
        private hasPlayedEpisodes = false;

        public get progress(): number {
            return this.hasPlayedEpisodes ? 100 : 0;
        }

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
        }

        public mounted(): void {
            this.fetchEpisodeLoadingStateFromStore();
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        @Emit('clicked')
        private clicked(): SeriesEpisode['key'] {
            return this.seasonInfo.key;
        }

        private fetchEpisodeLoadingStateFromStore(): void {
            this.store.selectBehaviour(hasAsyncInteractionForType, AsyncInteractionType.PORTAL_GET_SEASON_EPISODES).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isLoading => {
                const hasSeasonEpisodes = Boolean(this.store.selectSync(getSeriesEpisodesForSeason, this.seasonInfo.key).length);
                this.isSeasonLoading = isLoading && !hasSeasonEpisodes;
            });

            this.store.selectBehaviour(hasSeasonAlreadyPlayedEpisodes, this.seasonInfo.key).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(hasPlayedEpisodes => this.hasPlayedEpisodes = hasPlayedEpisodes);
        }
    }
</script>
