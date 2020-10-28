<template>
    <div>
        <h2>Test actions</h2>
        <div>
            <button class="btn btn-primary" @click="startTestEpisodeOverBs">Start Test Episode Over BS</button>
        </div>
        <div class="pt-2">
            <button class="btn btn-primary" @click="openTestPage">Open Test Page</button>
        </div>
        <div class="pt-2">
            <button class="btn btn-primary" @click="startTestRecaptcha">Start Recaptcha on test page</button>
        </div>
        <div class="pt-2">
            <button @click="showAllWindows" class="btn btn-primary">Show all windows</button>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { optionsContainer } from '../container/container';
    import { StoreService } from '../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
    import { MessageService } from '../../../shared/services/message.service';
    import {
        createOpenTestPageMessage,
        createShowAllWindowsMessage,
        createStartTestEpisodeOverBSMessage,
        createStartTestRecaptchaBackgroundMessage,
    } from '../../../browserMessages/messages/test.messages';

    @Component({
        name: 'test-page',
    })
    export default class TestPage extends Vue {
        private store: StoreService;
        private messageService: MessageService;

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }

        public startTestEpisodeOverBs(): void {
            this.messageService.sendMessageToBackground(createStartTestEpisodeOverBSMessage());
        }

        public openTestPage(): void {
            this.messageService.sendMessageToBackground(createOpenTestPageMessage());
        }

        public startTestRecaptcha(): void {
            this.messageService.sendMessageToBackground(createStartTestRecaptchaBackgroundMessage());
        }

        public showAllWindows(): void {
            this.messageService.sendMessageToBackground(createShowAllWindowsMessage());
        }
    }
</script>
