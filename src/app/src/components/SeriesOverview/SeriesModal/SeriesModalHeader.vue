<template>

    <div v-if="series" class="relative header-height">
        <div v-if="showVideo" class="absolute overflow-hidden header-height">
            <youtube :video-id="youtubeUrl" player-width="900" player-height="507" @ended="onVideoFinished"/>
        </div>
        <div v-else class="w-full absolute">
            <img :src="series.backgroundHref" class="w-full">
        </div>
        <div class="absolute text">
            <span class="text-4xl font-mono text-white font-extrabold">{{series.titles[language]}}</span>
        </div>
    </div>
</template>

<script lang="ts">
    import Component from 'vue-class-component';
    import Vue from 'vue';
    import { Prop, Watch } from 'vue-property-decorator';
    import Series from '../../../../../store/models/series.model';
    import { Hoster } from '../../../../../store/enums/hoster.enum';
    import { LANGUAGE } from '../../../../../store/enums/language.enum';

    @Component({
        name: 'series-modal-header',
    })
    export default class SeriesModalHeader extends Vue {
        @Prop(Object)
        private series: Series;

        @Prop(String)
        private language: LANGUAGE;

        private videoFinished = false;

        private get youtubeUrl(): string {
            const id = this.series?.previewVideos[Hoster.YOUTUBE];
            if (id) {
                return `${id}?autoplay=1&controls=1&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0`;
            }
            return '';
        }

        private get showVideo(): boolean {
            return Boolean(this.series?.previewVideos[Hoster.YOUTUBE]) && !this.videoFinished;
        }

        @Watch('series')
        private reset(): void {
            this.videoFinished = false;
        }

        public onVideoFinished(): void {
            this.videoFinished = true;
        }
    }
</script>

<style scoped lang="scss">
    @import 'src/styles/variables';

    .video-overlay {
        background: linear-gradient(to top, #181818, transparent 50%);
    }

    .header-height {
        height: 374px;
    }

    .text {
        bottom: 3rem;
        left: 3rem;
    }
</style>
