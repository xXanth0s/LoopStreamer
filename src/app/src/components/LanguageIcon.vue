<template>

    <div :title="title" class="relative w-5 h-5"
         :class="{'cursor-pointer': !isActive}">
        <img :src="imageSrc">
        <div v-if="!isActive && !isHover"
             class="rounded-full absolute bottom-0 h-full w-full bg-gray-400 bg-opacity-75"></div>
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
