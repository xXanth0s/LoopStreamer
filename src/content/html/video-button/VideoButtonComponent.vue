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
                            <div class="spinner-border video-button" v-if="isStartingPrevious"
                                 role="status">
                                <span class="sr-only"></span>
                            </div>
                            <i class="fas fa-chevron-left video-button" v-else/>
                        </label>
                        <label class="btn btn-primary btn-lg" @click.stop.prevent="toggleFullscreenMode"
                               :title="fullscreenTitle">
                            <i class="fas fa-compress-alt" v-if="isFullscreen"/>
                            <i class="fas fa-expand-alt" v-else/>
                        </label>
                        <label class="btn btn-primary btn-lg" :disabled="!hasNextEpisode || isLoading"
                               @click.stop.prevent="next">
                            <div class="spinner-border video-button" v-if="isStartingNext"
                                 role="status">
                                <span class="sr-only"></span>
                            </div>

                            <i class="fas fa-chevron-right video-button" v-else/>
                        </label>
                    </div>
                </div>
            </transition>

        </div>
    </div>
</template>

<script lang="ts">
    // eslint-disable-next-line import/no-extraneous-dependencies
    import { remote } from 'electron';
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
        createToggleWindowFullscreenMessage,
    } from '../../../browserMessages/messages/background.messages';
    import { getWindowStateForWindowId } from '../../../store/selectors/control-state.selector';
    import {
        hasSeriesEpisodeNextEpisode,
        hasSeriesEpisodePreviousEpisode
    } from '../../../store/selectors/series-episode.selector';
    import { BrowserWindowStateModel } from '../../../store/models/browser-window-state.model';
    import { PopupController } from '../../controller/popup.controller';
    import { CONTENT_TYPES } from '../../container/CONTENT_TYPES';

    @Component({
        name: 'ls-video-buttons',
    })
    export default class VideoButtonComponent extends Vue {
        private readonly messageService: MessageService = inversifyContentContainer.get(SHARED_TYPES.MessageService);
        private readonly store: StoreService = inversifyContentContainer.get(SHARED_TYPES.StoreService);
        private readonly popupController: PopupController = inversifyContentContainer.get(CONTENT_TYPES.PopupController);

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

        private windowId: number;

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
            this.popupController.openVideoIsPreparingPopup();
        }

        public next(): void {
            this.isStartingNext = true;
            this.messageService.sendMessageToBackground(createOpenNextVideoMessage(this.episodeInfo.key));
            this.popupController.openVideoIsPreparingPopup();
        }

        public toggleFullscreenMode(): void {
            this.messageService.sendMessageToBackground(createToggleWindowFullscreenMessage(this.windowId));
        }
        public mounted(): void {
            this.windowId = remote.getCurrentWindow().id;

            setTimeout(() => this.showButtons = false, this.buttonsVisibilityTime);

            this.hasPreviousEpisode = this.store.selectSync(hasSeriesEpisodePreviousEpisode, this.episodeInfo.key);
            this.hasNextEpisode = this.store.selectSync(hasSeriesEpisodeNextEpisode, this.episodeInfo.key);

            this.initMouseEventListeners();
            this.initKeyboardListener();
            this.fetchFullscreenModeFromStore();
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

        private fetchFullscreenModeFromStore(): void {
            this.store.select(getWindowStateForWindowId, this.windowId).pipe(
                filter<BrowserWindowStateModel>(Boolean),
            ).subscribe(windowState => {
                this.fullscreen = windowState.windowState === 'fullscreen';
            });
        }
    }
</script>
