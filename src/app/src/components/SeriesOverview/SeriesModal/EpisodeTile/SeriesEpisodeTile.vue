<template>
    <div>
        <div class="flex" v-if="episode">
            <div class="relative preview-image rounded-sm overflow-hidden">
                <img class="top-0 h-full absolute" :src="episode.posterHref">
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
        <div v-if="episode.timestamp">
            <b-progress :max="100" :value="progress" class="w-full h-0.5 mt-1" variant="info">
            </b-progress>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';
    import { SeriesEpisode } from '../../../../../../store/models/series-episode.model';
    import { LANGUAGE } from '../../../../../../store/enums/language.enum';
    import EpisodePlayButton from './EpisodePlayButton.vue';
    import { getProgressForEpisode } from '../../../../../../store/utils/series.utils';

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

        public get progress(): number {
            return getProgressForEpisode(this.episode);
        }
    }
</script>

<style scoped lang="scss">
    .preview-image {
        flex: 0 0 17%;
        padding: 5% 0;
    }
</style>
