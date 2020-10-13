<template>
    <div class="ls-container">
        <div class="ls-video-buttons"
             @mouseover="isMouseOnButton = true"
             @mouseleave="isMouseOnButton = false">
            <transition name="fade">
                <div v-if="showButtons">
                    <div class="btn-group btn-group-toggle" data-toggle="buttons">
                        <label class="btn btn-primary btn-lg" :disabled="!hasPreviousEpisode || isLoading"
                               @click.stop.prevent="previous" title="Vorherige Episode">
                            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-chevron-left"
                                 v-if="!isStartingPrevious"
                                 fill="currentColor"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                      d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                            </svg>

                            <div class="spinner-border" v-if="isStartingPrevious" style="width: 1em; height: 1em;"
                                 role="status">
                                <span class="sr-only"></span>
                            </div>
                        </label>
                        <label class="btn btn-primary btn-lg" @click.stop.prevent="toggleFullscreenMode"
                               :title="fullscreenTitle">
                            <svg v-if="!isFullscreen" width="1em" height="1em" viewBox="0 0 16 16"
                                 class="bi bi-arrows-angle-expand" fill="currentColor"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                      d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z"/>
                            </svg>
                            <svg v-if="isFullscreen" width="1em" height="1em" viewBox="0 0 16 16"
                                 class="bi bi-arrows-angle-contract" fill="currentColor"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                      d="M.172 15.828a.5.5 0 0 0 .707 0l4.096-4.096V14.5a.5.5 0 1 0 1 0v-3.975a.5.5 0 0 0-.5-.5H1.5a.5.5 0 0 0 0 1h2.768L.172 15.121a.5.5 0 0 0 0 .707zM15.828.172a.5.5 0 0 0-.707 0l-4.096 4.096V1.5a.5.5 0 1 0-1 0v3.975a.5.5 0 0 0 .5.5H14.5a.5.5 0 0 0 0-1h-2.768L15.828.879a.5.5 0 0 0 0-.707z"/>
                            </svg>
                        </label>
                        <label class="btn btn-primary btn-lg" :disabled="!hasNextEpisode || isLoading"
                               @click.stop.prevent="next">
                            <svg width="1em" height="1em" v-if="!isStartingNext" viewBox="0 0 16 16"
                                 class="bi bi-chevron-right"
                                 fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd"
                                      d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                            </svg>
                            <div class="spinner-border" v-if="isStartingNext" style="width: 1em; height: 1em;"
                                 role="status">
                                <span class="sr-only"></span>
                            </div>
                        </label>
                    </div>
                </div>
            </transition>

        </div>
    </div>
</template>

<script lang="ts">
    import { fromEvent } from 'rxjs';
    import { debounceTime, filter, tap } from 'rxjs/operators';

    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop, Watch } from 'vue-property-decorator';
    import { MessageService } from '../../../shared/services/message.service';
    import { StoreService } from '../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
    // eslint-disable-next-line import/no-cycle
    import { inversifyContentContainer } from '../../container/container';
    import SeriesEpisode from '../../../store/models/series-episode.model';
    import {
        createOpenNextVideoMessage,
        createOpenPreviousVideoMessage,
        createToggleFullscreenModeMessage,
        createWindowResizedMessage,
    } from '../../../browserMessages/messages/background.messages';
    import { isVideoFullScreen } from '../../../store/selectors/control-state.selector';
    import {
        hasSeriesEpisodeNextEpisode,
        hasSeriesEpisodePreviousEpisode
    } from '../../../store/selectors/series-episode.selector';

    @Component({
        name: 'ls-video-buttons',
    })
    export default class ButtonComponent extends Vue {
        private readonly messageService: MessageService = inversifyContentContainer.get(SHARED_TYPES.MessageService);
        private readonly store: StoreService = inversifyContentContainer.get(SHARED_TYPES.StoreService);

        private readonly closeFullscreenTitle = 'Vollbildmodus beenden';
        private readonly openFullscreenTitle = 'Vollbild';

        @Prop(Object)
        private episodeInfo: SeriesEpisode;

        public get isFullscreen() {
            return this.fullscreen;
        }

        public get isLoading() {
            return this.isStartingNext || this.isStartingPrevious;
        }

        private fullscreen = false;
        private isStartingNext = false;
        private isStartingPrevious = false;

        public showButtons = true;
        public fullscreenTitle = this.openFullscreenTitle;

        private isMouseOnButton = false;
        private hasPreviousEpisode = false;
        private hasNextEpisode = false;

        private readonly buttonsVisibilityTime = 1500;

        public previous(): void {
            this.isStartingPrevious = true;
            this.messageService.sendMessageToBackground(createOpenPreviousVideoMessage(this.episodeInfo.key));
        }

        public next(): void {
            this.isStartingNext = true;
            this.messageService.sendMessageToBackground(createOpenNextVideoMessage(this.episodeInfo.key));
        }

        public toggleFullscreenMode(): void {
            this.messageService.sendMessageToBackground(createToggleFullscreenModeMessage());
        }

        public created(): void {
            this.initMouseEventListeners();
            this.initWindowStateListener();
            this.initKeyboardListener();
        }

        public mounted(): void {
            setTimeout(() => this.showButtons = false, this.buttonsVisibilityTime);
            this.hasPreviousEpisode = this.store.selectSync(hasSeriesEpisodePreviousEpisode, this.episodeInfo.key);
            this.hasNextEpisode = this.store.selectSync(hasSeriesEpisodeNextEpisode, this.episodeInfo.key);
        }

        @Watch('fullscreen')
        private setFullscreenTitle(isFullscreen: boolean) {
            this.fullscreenTitle = isFullscreen ? this.closeFullscreenTitle : this.openFullscreenTitle;
        }

        private initMouseEventListeners(): void {
            fromEvent(document.body, 'mousemove').pipe(
                tap(() => this.showButtons = true),
                debounceTime(this.buttonsVisibilityTime),
                filter(() => !this.isMouseOnButton),
            ).subscribe(() => this.showButtons = false);
        }

        private initWindowStateListener(): void {
            this.store.selectBehaviour(isVideoFullScreen)
                .subscribe(isFullScreen => this.fullscreen = isFullScreen);

            fromEvent(window, 'resize')
                .subscribe(() => this.messageService.sendMessageToBackground(createWindowResizedMessage()));
        }

        private initKeyboardListener(): void {
            fromEvent<KeyboardEvent>(document.body, 'keyup').pipe(
                filter(() => this.fullscreen),
                filter(event => event.key === 'Escape'),
            ).subscribe(() => {
                this.toggleFullscreenMode();
            });

            fromEvent<KeyboardEvent>(document.body, 'keyup').pipe(
                filter(event => event.key === 'f'),
            ).subscribe(() => {
                this.toggleFullscreenMode();
            });
        }
    }
</script>
