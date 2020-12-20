<template>
    <div>
        <series-episode-tile
                class="episode-tile"
                v-for="episode in episodes"
                :key="episode.key"
                :language="language"
                :episode="episode"/>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';
    import SeriesEpisode from '../../../../../store/models/series-episode.model';
    import SeriesEpisodeTile from './EpisodeTile/SeriesEpisodeTile.vue';
    import { LANGUAGE } from '../../../../../store/enums/language.enum';

    @Component({
        name: 'series-episode-list',
        components: {
            SeriesEpisodeTile,
        },
    })
    export default class SeriesEpisodeList extends Vue {
        @Prop(Array)
        private episodes: SeriesEpisode[];

        @Prop(String)
        private language: LANGUAGE;
    }
</script>

<style scoped lang="scss">
    @import "src/styles/variables";

    .episode-tile {
        padding-bottom: 4px;
        padding-top: 4px;

        &:not(:last-child) {
            border-bottom-color: lighten($gray, 10%) !important;
            border-bottom-width: 1px !important;
        }
    }
</style>
