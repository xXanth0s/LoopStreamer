<template>
    <div class="mt-1 series-item flex-center white-tile"
         :class="{selected: isActiveEpisode, disabled: isCompletelyBlocked}">
        <div v-if="isActiveEpisode && isCompletelyBlocked"
             class="spinner-border tile-spinner"
             role="status">
            <span class="sr-only"></span>
        </div>
        <div v-else>
            {{episodeInfo.episodeNumber}}
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
    import { StoreService } from '../../../../shared/services/store.service';
    import { optionsContainer } from '../../container/container';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { getActiveEpisode } from '../../../../store/selectors/control-state.selector';

    @Component({
        name: 'series-episode-button',
    })
    export default class SeriesEpisodeButton extends Vue {

        private readonly takeUntil$ = new Subject();

        @Prop(Object)
        private episodeInfo: SeriesEpisode;

        @Prop(Boolean)
        private isBlocked: boolean;

        private messageService: MessageService;
        private store: StoreService;

        private activeEpisodeKey: string;

        private get isCompletelyBlocked(): boolean {
            return this.isBlocked && Boolean(this.activeEpisodeKey);
        }

        private isActiveEpisode(): boolean {
            return this.activeEpisodeKey === this.episodeInfo.key;
        }

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }

        public mounted(): void {
            this.setSelectedEpisode();
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        private setSelectedEpisode(): void {
            this.store.select(getActiveEpisode).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(activeEpisode => this.activeEpisodeKey = activeEpisode);
        }
    }
</script>

<style scoped lang="scss">

    @import "src/styles/variables";

    .flex-center {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
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
</style>
