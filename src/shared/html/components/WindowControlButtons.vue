<template>
    <div class="window-control-buttons"
         @mouseover="mouseEnteringButtons"
         @mouseout="mouseLeavingButtons">
        <div>
        <transition name="fade">
            <div v-if="showButtons" class="vertical-felx">
                <div class="button flex-center button primary-button"
                     @click="minimizeButtonClicked">
                    <i class="fas fa-minus"></i>
                </div>
                <div class="button flex-center button primary-button"
                     @click="fullscreenButtonClicked">
                    <i class="fas fa-square"></i>
                </div>
                <div class="button flex-center button red-button"
                     @click="closeButtonClicked">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        </transition>
        </div>
    </div>
</template>

<script lang="ts">
    // eslint-disable-next-line import/no-extraneous-dependencies
    import { remote } from 'electron';
    import Component from 'vue-class-component';
    import Vue from 'vue';
    import { debounceTime, filter, tap } from 'rxjs/operators';
    import { Prop } from 'vue-property-decorator';
    import { Subject } from 'rxjs';
    import { optionsContainer } from '../../../app/src/container/container';
    import { StoreService } from '../../services/store.service';
    import { SHARED_TYPES } from '../../constants/SHARED_TYPES';
    import { MessageService } from '../../services/message.service';
    import {
        createCloseWindowMessage,
        createMinimizeWindowMessage,
        createToggleWindowMaximizationMessage,
    } from '../../../browserMessages/messages/background.messages';

    @Component({
        name: 'WindowControlButtons',
    })
    export default class WindowControlButtons extends Vue {

        private readonly buttonsVisibilityTime = 5000;

        @Prop(Boolean)
        private hideButtons: boolean;

        private windowId: number;

        private messageService: MessageService;
        private store: StoreService;

        private isMouseOnButton = false;
        private showButtons = true;

        private hideButtons$ = new Subject();

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }

        public mounted(): void {
            this.windowId = remote.getCurrentWindow().id;
            this.initMouseEventListeners();
        }

        closeButtonClicked(): void {
            this.messageService.sendMessageToBackground(createCloseWindowMessage());
        }

        minimizeButtonClicked(): void {
            this.messageService.sendMessageToBackground(createMinimizeWindowMessage());
        }

        fullscreenButtonClicked(): void {
            this.messageService.sendMessageToBackground(createToggleWindowMaximizationMessage());
        }

        private initMouseEventListeners(): void {
            if (!this.hideButtons) {
                return;
            }

            this.hideButtons$.pipe(
                tap(() => this.showButtons = true),
                debounceTime(this.buttonsVisibilityTime),
                filter(() => !this.isMouseOnButton),
            ).subscribe(() => {
                this.showButtons = false;
            });

            this.hideButtons$.next();
        }

        private mouseEnteringButtons(): void {
            this.isMouseOnButton = true;
            this.hideButtons$.next();
        }

        private mouseLeavingButtons(): void {
            this.isMouseOnButton = false;
            this.hideButtons$.next();
        }
    }
</script>
