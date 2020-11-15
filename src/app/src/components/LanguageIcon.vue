<template>
    <div @mouseover="isHover = true"
         @mouseout="isHover = false"
         :title="title"
         class="relative w-6 h-6 rounded-full"
         :class="containerClass">
        <img :src="imageSrc" :class="{active: isActive}">
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Emit, Prop } from 'vue-property-decorator';
    import { LANGUAGE } from '../../../store/enums/language.enum';

    @Component({
        name: 'language-icon',
    })
    export default class LanguageIcon extends Vue {
        private isHover = false;

        get containerClass() {
            const showHoverEffect = !this.isActive && this.isHover;
            return {
                'cursor-pointer': !this.isActive,
                'p-1': !this.isActive && !this.isHover,
                active: this.isActive,
                hover: showHoverEffect,
            };
        }

        @Prop(String)
        private title: string;

        @Prop(String)
        private language: LANGUAGE;

        @Prop(String)
        private imageSrc: string;

        @Prop(Boolean)
        private isActive: boolean;

        @Emit('click')
        private clicked(): LANGUAGE {
            return this.language;
        }
    }
</script>

<style lang="scss" scoped>
    @import "src/styles/variables";

    .active {
        border-width: 4px;
        border-color: darken($primary-color, 5%);
    }

    .hover {
        border-width: 4px;
        border-color: $primary-color;
    }
</style>
