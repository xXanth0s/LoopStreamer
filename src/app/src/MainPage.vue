<template>
    <div>
        <nav-bar/>
        <div class="bg-white pb-10 px-4 pt-4 mt-16 mx-4">
            <div class="tab-content">
                <div class="tab-pane active">
                    <router-view/>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import NavBar from './components/NavBar.vue';
    import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
    import { optionsContainer } from './container/container';
    import { StoreService } from '../../shared/services/store.service';
    import { MessageService } from '../../shared/services/message.service';

    @Component({
        components: {
            NavBar,
        },
        provide: {
            [SHARED_TYPES.StoreService]: optionsContainer.get<StoreService>(SHARED_TYPES.StoreService),
            [SHARED_TYPES.MessageService]: optionsContainer.get<MessageService>(SHARED_TYPES.MessageService),
        },
    })
    export default class MainPage extends Vue {
    }

</script>

<style lang="scss" scoped>
    @import 'src/styles/variables';

    .container {
        margin-top: 70px;
        min-width: 800px;
        width: $containerWidth;
        background-color: $containerBackground;
        min-height: 760px;
        padding: 20px;
    }
</style>
