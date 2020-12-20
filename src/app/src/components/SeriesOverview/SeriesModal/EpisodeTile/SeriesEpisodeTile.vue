<template>
    <div class="flex" v-if="episode">
        <div class="h-20">
            <img class="h-full" :src="episode.posterHref">
        </div>
        <div class="flex-grow-1 flex flex-column justify-center">
            <div class="pl-3 items-start flex">
                <span class="font-bold pr-1">{{episode.episodeNumber}}:</span>
                <span>
                    {{title}}
                </span>
            </div>
        </div>
        <episode-play-button :episode-key="episode.key"/>
    </div>

</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';
    import SeriesEpisode from '../../../../../../store/models/series-episode.model';
    import { LANGUAGE } from '../../../../../../store/enums/language.enum';
    import EpisodePlayButton from './EpisodePlayButton.vue';

    @Component({
        name: 'SeriesEpisodeTile',
        components: {
            EpisodePlayButton,
        },
    })
    export default class SeriesEpisodeTile extends Vue {
        @Prop(Object)
        private episode: SeriesEpisode;

        @Prop(String)
        private language: LANGUAGE;

        private get title(): string {
            return this.episode.title[this.language] || this.episode.title[0];
        }
    }
</script>

<style scoped>

</style>
