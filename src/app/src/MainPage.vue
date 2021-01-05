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
        <async-interaction-spinner :async-interaction="asyncInteraction"/>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { takeUntil } from 'rxjs/operators';
    import { Subject } from 'rxjs';
    import NavBar from './components/NavBar.vue';
    import { SHARED_TYPES } from '../../shared/constants/SHARED_TYPES';
    import { appContainer } from './container/container';
    import { StoreService } from '../../shared/services/store.service';
    import { MessageService } from '../../shared/services/message.service';
    import AsyncInteractionSpinner from './components/AsyncInteractionSpinner.vue';
    import { AsyncInteraction } from '../../store/models/async-interaction.model';
    import { getFirstAsyncInteraction } from '../../store/selectors/async-interaction.selector';

    @Component({
        components: {
            NavBar,
            AsyncInteractionSpinner,
        },
        provide: {
            [SHARED_TYPES.StoreService]: appContainer.get<StoreService>(SHARED_TYPES.StoreService),
            [SHARED_TYPES.MessageService]: appContainer.get<MessageService>(SHARED_TYPES.MessageService),
        },
    })
    export default class MainPage extends Vue {
        private readonly takeUntil$ = new Subject();

        private asyncInteraction: AsyncInteraction<any> = null;

        private store: StoreService;

        public mounted(): void {
            this.store = appContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.fetchAsyncInteractionsFromStore();
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        private fetchAsyncInteractionsFromStore(): void {
            this.store.selectBehaviour(getFirstAsyncInteraction).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(asyncInteraction => {
                this.asyncInteraction = asyncInteraction;
            });
        }
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
