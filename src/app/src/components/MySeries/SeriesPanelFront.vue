<template>
    <div class="">

        <div class="flex-column bordered">
            <div class="image-container relative">
                <i v-if="showSettingsIcon" class="fas fa-cog spin-icon absolute top-0 right-0 mt-2 mr-2 icon"></i>
                <img class="absolute top-0" :src="imageUrl">
            </div>
            <div class="flex flex-grow-0 text-lg justify-center items-center h-10 whitespace-nowrap">
                <span class="truncate mx-1">{{seriesName}}</span>
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
        imageUrl: string;

        @Prop(String)
        seriesName: string;

        @Prop(Boolean)
        showSettingsIcon: string;
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

    .image-container {
        padding: 75% 0;
    }
</style>
