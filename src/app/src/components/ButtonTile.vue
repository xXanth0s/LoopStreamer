<template>
    <div :class="[{selected: isActive, disabled: isDisabled}, progressClass]"
         class="mt-1 series-item flex-center white-tile"
         :title="title"
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

        @Prop({ default: 0 })
        private progress: number;

        @Prop({ default: false })
        private isLoading: boolean;

        @Prop({ default: '' })
        private title: string;

        @Emit('clicked')
        public clicked(): void {
        }

        get progressClass(): string {
            return this.isActive ? '' : `progress-${this.progress}`;
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

    @for $i from 0 through 100 {
        .progress-#{$i} {
            background: -webkit-linear-gradient(left, $light-blue-color $i * 1%, white $i * 1%);
        }
    }

    .series-item {
        cursor: pointer;

        &:hover, &.selected {
            background: -webkit-linear-gradient(left, $primary-color 100%, white 100%);
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
