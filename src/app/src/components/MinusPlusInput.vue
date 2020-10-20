<template>
    <div class="input-group">
        <div class="input-group-prepend">
            <span :class="{disabled: isMinusButtonDisabled}"
                  @click="changeValue(-1)"
                  class="input-group-text input-button">-</span>
        </div>
        <input class="form-control number-input" type="text" v-model="inputValue" v-on:blur="validateValue">
        <div class="input-group-append">
            <span @click="changeValue(1)" class="input-group-text input-button" id="basic-addon2">+</span>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Emit, Prop, Watch } from 'vue-property-decorator';
    import Component from 'vue-class-component';

    @Component({
        name: 'minus-plus-input',
    })
    export default class MinusPlusInput extends Vue {

        @Prop(Number)
        public value: number;
        private lastValidatedValue: number;
        private inputValue = 0;

        private get isMinusButtonDisabled(): boolean {
            return this.inputValue <= 0;
        }

        @Emit('input')
        public inputChanged(): number {
            return this.inputValue;
        }

        @Watch('value')
        private setValue(newValue: number): void {
            this.lastValidatedValue = newValue;

            this.inputValue = newValue;
        }

        private validateValue(): void {
            if (Number.isNaN(this.inputValue) || this.inputValue < 0) {
                this.inputValue = this.lastValidatedValue;
                return;
            }

            this.lastValidatedValue = this.inputValue;
            this.inputChanged();
        }

        private changeValue(offset: number): void {
            this.inputValue += offset;
            this.validateValue();
        }
    }
</script>

<style lang="scss" scoped>

    .input-group {
        width: auto;
    }

    .input-button {
        cursor: pointer;
        -webkit-user-select: none;

        &.disabled {
            cursor: not-allowed;

        }
    }

    .number-input {
        max-width: 50px;
        text-align: center;
    }
</style>
