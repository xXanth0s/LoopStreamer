<template>
    <div class="ls-container">
        <div class="ls-video-buttons"
             @mouseover="isMouseOnButton = true"
             @mouseleave="isMouseOnButton = false"
             v-if="episodeInfo">
            <transition name="fade">
                <div v-if="showButtons">
                    <div class="btn-group btn-group-toggle" data-toggle="buttons">
                        <label :disabled="!episodeInfo.hasPreviousEpisode || isPreparingVideo"
                               class="btn btn-primary btn-lg"
                               @click.stop.prevent="previous" title="Vorherige Episode">
                            <div class="spinner-border video-button" v-if="isStartingPrevious"
                                 role="status">
                                <span class="sr-only"></span>
                            </div>
                            <i class="fas fa-chevron-left video-button" v-else/>
                        </label>
                        <label @click.stop.prevent="togglePictureInPicture" class="btn btn-primary btn-lg">
                            <i class="far fa-clone" v-if="isPictureInPicture"></i>
                            <i class="fas fa-clone" v-else></i>
                        </label>
                        <label class="btn btn-primary btn-lg" @click.stop.prevent="toggleFullscreenMode"
                               :title="fullscreenTitle">
                            <i class="fas fa-compress-alt" v-if="isFullscreen"/>
                            <i class="fas fa-expand-alt" v-else/>
                        </label>
                        <label :disabled="!episodeInfo.hasNextEpisode || isPreparingVideo"
                               class="btn btn-primary btn-lg"
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
    import { SeriesEpisode } from '../../../store/models/series-episode.model';
    import { createToggleWindowFullscreenMessage } from '../../../browserMessages/messages/background.messages';
    import { getWindowStateForWindowId } from '../../../store/selectors/control-state.selector';
    import { BrowserWindowStateModel } from '../../../store/models/browser-window-state.model';
    import { PopupController } from '../../controller/popup.controller';
    import { CONTENT_TYPES } from '../../container/CONTENT_TYPES';
    import { startNextEpisodeAction, startPreviousEpisodeAction } from '../../../store/actions/shared.actions';
    import { getSeriesEpisodeByKey } from '../../../store/selectors/series-episode.selector';
    import { setPictureInPictureAction } from '../../../store/reducers/control-state.reducer';
    import { isVideoPictureInPicture } from '../../../store/selectors/app-control-state.selector';
    import { isPreparingVideo } from '../../../store/selectors/async-interaction.selector';

    @Component({
        name: 'ls-video-buttons',
    })
    export default class VideoButtonComponent extends Vue {
        private readonly messageService: MessageService = inversifyContentContainer.get(SHARED_TYPES.MessageService);
        private readonly store: StoreService = inversifyContentContainer.get(SHARED_TYPES.StoreService);
        private readonly popupController: PopupController = inversifyContentContainer.get(CONTENT_TYPES.PopupController);

        private readonly closeFullscreenTitle = 'Vollbildmodus beenden';
        private readonly openFullscreenTitle = 'Vollbild';

        @Prop(String)
        private episodeKey: SeriesEpisode['key'];

        public get isFullscreen() {
            return this.fullscreen;
        }

        private episodeInfo: SeriesEpisode = null;

        private windowId: number;

        private fullscreen = false;
        private isPictureInPicture = false;
        private isStartingNext = false;
        private isStartingPrevious = false;
        private isPreparingVideo = false;

        public showButtons = true;
        public fullscreenTitle = this.openFullscreenTitle;

        private isMouseOnButton = false;

        private readonly buttonsVisibilityTime = 1500;

        public previous(): void {
            this.isStartingPrevious = true;
            this.store.dispatch(startPreviousEpisodeAction(this.episodeKey));
            this.popupController.openVideoIsPreparingPopup();
        }

        public next(): void {
            this.isStartingNext = true;
            this.store.dispatch(startNextEpisodeAction({ episodeKey: this.episodeKey, userAction: true }));
            this.popupController.openVideoIsPreparingPopup();
        }

        public toggleFullscreenMode(): void {
            this.messageService.sendMessageToBackground(createToggleWindowFullscreenMessage());
        }

        public mounted(): void {
            this.windowId = remote.getCurrentWindow().id;

            setTimeout(() => this.showButtons = false, this.buttonsVisibilityTime);

            this.initMouseEventListeners();
            this.initKeyboardListener();
            this.fetchFullscreenModeFromStore();
            this.fetchEpisodeInfoFromStore();
            this.fetchPictureInPictureStateFromStore();
            this.fetchVideoLoadingState();
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
            ).subscribe(event => {
                event.preventDefault();
                event.stopPropagation();
                this.toggleFullscreenMode();
            });

            fromEvent<KeyboardEvent>(document.body, 'keyup').pipe(
                filter(event => event.key === 'f'),
            ).subscribe(event => {
                event.preventDefault();
                event.stopPropagation();
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

        private fetchEpisodeInfoFromStore(): void {
            this.store.selectBehaviour(getSeriesEpisodeByKey, this.episodeKey)
                .subscribe(episodeInfo => this.episodeInfo = episodeInfo);
        }

        private fetchPictureInPictureStateFromStore(): void {
            this.store.selectBehaviour(isVideoPictureInPicture)
                .subscribe(isPictureInPicture => this.isPictureInPicture = isPictureInPicture);
        }

        private togglePictureInPicture(): void {
            this.store.dispatch(setPictureInPictureAction(!this.isPictureInPicture));
        }

        private fetchVideoLoadingState(): void {
            this.store.selectBehaviour(isPreparingVideo)
                .subscribe(isPreparingVideoVal => this.isPreparingVideo = isPreparingVideoVal);
        }
    }
</script>
