<template>
    <div>
        <h2>Test actions</h2>
        <div>
            <button class="btn btn-primary" @click="startTestAction">Start Test Episode Over BS</button>
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
    import { createStartTestEpisodeOverBS } from '../../../browserMessages/messages/test.messages';

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

        public startTestAction(): void {
            this.messageService.sendMessageToBackground(createStartTestEpisodeOverBS());
        }
    }
</script>
