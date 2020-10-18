<template>
    <div class="mt-1 series-item flex-center white-tile "
         :class="{selected: isActive, disabled: isDisabled}"
         @click="clicked">
        <div v-if="isLoading"
             class="spinner-border tile-spinner"
             role="status">
            <span class="sr-only"></span>
        </div>
        <div v-else>
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Emit, Prop } from 'vue-property-decorator';

    @Component({
        name: 'button-tile',
    })
    export default class ButtonTile extends Vue {

        @Prop({ default: false })
        private isActive: boolean;

        @Prop({ default: false })
        private isDisabled: boolean;

        @Prop({ default: false })
        private isLoading: boolean;

        @Emit('clicked')
        public clicked(): void {
        }
    }
</script>

<style scoped lang="scss">

    @import "src/styles/variables";

    .flex-center {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .white-tile {
        height: 40px;
        color: black;
        background-color: white;
    }

    .series-item {
        cursor: pointer;

        &:hover, &.selected {
            background-color: $primary-color;
        }

        &.disabled {
            cursor: not-allowed;
        }

        min-width: 35px;
    }

    .tile-spinner {
        height: 18px;
        width: 18px;
    }
</style>
