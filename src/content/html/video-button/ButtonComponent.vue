<template>
    <div class="ls-video-buttons"
          @mouseover="isMouseOnButton = true"
          @mouseleave="isMouseOnButton = false">
    <transition name="fade">
        <div class="btn-group btn-group-toggle" data-toggle="buttons">
            <label class="btn btn-secondary active">
                <input type="radio" name="options" id="option1" autocomplete="off" checked> Active
            </label>
            <label class="btn btn-secondary">
                <input type="radio" name="options" id="option2" autocomplete="off"> Radio
            </label>
            <label class="btn btn-secondary">
                <input type="radio" name="options" id="option3" autocomplete="off"> Radio
            </label>
        </div>
        <!--                <b-button-group v-if="showButtons">-->
        <!--                    <b-button  variant="primary" :disabled="!episodeInfo.hasPreviousEpisode" @click.stop.prevent="previous"  title="Vorherige Episode">-->
        <!--                        <b-icon icon="chevron-left" font-scale="3"></b-icon>-->
        <!--                    </b-button>-->
        <!--                    <b-button variant="primary" @click.stop.prevent="toggleFullscreenMode" :title="fullscreenTitle">-->
        <!--                        <b-icon icon="arrows-angle-expand" v-if="!isFullscreen" font-scale="3"></b-icon>-->
        <!--                        <b-icon icon="arrows-angle-contract" v-if="isFullscreen" font-scale="3"></b-icon>-->
        <!--                    </b-button>-->
        <!--                    <b-button variant="primary" :disabled="!episodeInfo.hasNextEpisode" @click.stop.prevent="next" title="Nächste Episode">-->
        <!--                        <b-icon icon="chevron-right" font-scale="3"></b-icon>-->
        <!--                    </b-button>-->
        <!--                </b-button-group>-->
    </transition>
</div>
</template>

<script type="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Watch, Prop } from 'vue-property-decorator';
    import { fromEvent } from 'rxjs';
    import { debounceTime, filter, tap } from 'rxjs/operators';

    import {MessageService} from "../../../shared/services/message.service";
    import {StoreService} from "../../../shared/services/store.service";
    import {SHARED_TYPES} from "../../../shared/constants/SHARED_TYPES";
    import { inversifyContentContainer } from '../../container/container';
    import SeriesEpisode from '../../../store/models/series-episode.model';
    import {
        createOpenNextVideoMessage,
        createOpenPreviousVideoMessage, createToggleFullscreenModeMessage, createWindowResizedMessage
    } from "../../../browserMessages/messages/background.messages";
    import { isVideoFullScreen } from '../../../store/selectors/control-state.selector';

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

        private fullscreen: boolean = false;


        public showButtons = true;
        public fullscreenTitle = this.openFullscreenTitle;

        private isMouseOnButton = false;
        private readonly buttonsVisibilityTime = 1500;


        public previous(): void {
            this.messageService.sendMessageToBackground(createOpenPreviousVideoMessage());
        }

        public next(): void {
            this.messageService.sendMessageToBackground(createOpenNextVideoMessage());
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
            setTimeout(() => this.showButtons = false, this.buttonsVisibilityTime)
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
                filter(event => event.key === "Escape"),
            ).subscribe(() => {
                this.toggleFullscreenMode();
            });

            fromEvent<KeyboardEvent>(document.body, 'keyup').pipe(
                filter(event => event.key === "f"),
            ).subscribe(() => {
                this.toggleFullscreenMode();
            });
        }
    }

</script>

<style scoped>

</style>
