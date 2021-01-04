<template>
    <div class="bottom-0 right-0 top-container async-container py-1 px-2"  v-if="asyncInteraction">
        <div class="spinner-border" role="status" style="width: 1rem; height: 1rem;">
            <span class="sr-only"></span>
        </div>
        <span class="pl-1">{{textMap[asyncInteraction.type]}}</span>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';
    import { AsyncInteraction } from '../../../store/models/async-interaction.model';
    import Spinner from './Shared/Spinner.vue';
    import { ASYNC_INTERACTION_TEXT_MAP } from '../constants/async-interaction-text-map.const';

    @Component({
        name: 'async-interaction-spinner',
        components: {
            Spinner,
        },
    })
    export default class AsyncInteractionSpinner extends Vue {
        public readonly textMap = ASYNC_INTERACTION_TEXT_MAP;

        @Prop(Object)
        private asyncInteraction: AsyncInteraction<any>;
    }
</script>

<style scoped lang="scss">
    @import 'src/styles/variables';
    .async-container {
        background-color: $primary-color;
        opacity: .7;
        z-index: 1050;
        position: fixed;
    }
</style>
