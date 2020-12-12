<template>
    <div class="h-full">

        <div class="flex-column bordered">
            <div>
                <i v-if="showSettingsIcon" class="fas fa-cog spin-icon absolute top-0 right-0 mt-2 mr-2 icon"></i>
                <img :src="imageUrl" alt="Avatar">
            </div>
            <div class="flex flex-grow-0 text-lg justify-center items-center h-10 whitespace-nowrap">
                {{seriesName}}
            </div>
        </div>
    </div>
</template>

<script lang="ts">

    import Component from 'vue-class-component';
    import Vue from 'vue';
    import { Prop } from 'vue-property-decorator';

    @Component({
        name: 'series-panel-front',
        components: {},
    })
    export default class SeriesPanelFront extends Vue {

        @Prop(String)
        imageUrlEnding: string;

        @Prop(String)
        seriesName: string;

        @Prop(Boolean)
        showSettingsIcon: string;

        public get imageUrl(): string {
            return `https://image.tmdb.org/t/p/w440_and_h660_face/${this.imageUrlEnding}`;
        }
    }
</script>

<style lang="scss" scoped>
    @import "src/styles/variables";

    .bordered {
        &:hover {
            box-shadow: $shadow-normal;
        }

        box-shadow: $shadow-light;
        transition: 0.3s;
    }
</style>
