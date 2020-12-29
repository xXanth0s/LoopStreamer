<template>

    <div v-if="series" class="relative header-height">
        <div v-if="showVideo" class="absolute overflow-hidden header-height">
            <youtube :video-id="youtubeUrl"
                     player-width="895"
                     player-height="507"
                     :mute="muteVideo"
                     @ended="onVideoFinished"
                     @error="onVideoFinished"/>
        </div>
        <div v-else class="w-full absolute">
            <img :src="series.backgroundHref" class="w-full">
        </div>
        <div class="absolute w-full h-full video-overlay">
        </div>
        <div class="absolute text">
            <span class="text-4xl text-white font-extrabold">
                {{series.titles[language]}}
            </span>
        </div>
        <div class="absolute close-button">
            <button type="button"
                    class="btn btn-outline-primary rounded-full h-12 w-12"
                    @click.stop="closeModal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="absolute mute-button" v-if="showVideo">
            <button type="button"
                    class="btn btn-outline-primary rounded-full h-12 w-12"
                    @click.stop="toggleMuteState">
                <i v-if="muteVideo" class="fas fa-volume-mute"></i>
                <i v-else class="fas fa-volume-up"></i>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
    import Component from 'vue-class-component';
    import Vue from 'vue';
    import {
      Emit, Inject, Prop, Watch,
    } from 'vue-property-decorator';
    import { takeUntil } from 'rxjs/operators';
    import { Subject } from 'rxjs';
    import { Series } from '../../../../../store/models/series.model';
    import { Hoster } from '../../../../../store/enums/hoster.enum';
    import { LANGUAGE } from '../../../../../store/enums/language.enum';
    import { SHARED_TYPES } from '../../../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../../../shared/services/store.service';
    import { getMutePreviewVideoState } from '../../../../../store/selectors/app-control-state.selector';
    import { toggleMutePreviewVideoStateAction } from '../../../../../store/reducers/app-control-state.reducer';
    import { environment } from '../../../../../environments/environment';

    @Component({
        name: 'series-modal-header',
    })
    export default class SeriesModalHeader extends Vue {
        @Prop(Object)
        private series: Series;

        @Prop(String)
        private language: LANGUAGE;

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        private readonly takeUntil$ = new Subject();

        private videoFinished = false;
        private muteVideo = false;

        private get youtubeUrl(): string {
            const id = this.series?.previewVideos[Hoster.YOUTUBE];
            if (!id) {
                return '';
            }
            const autoplay = +environment.autoPlayPreviewVideos;
            return `${id}?autoplay=${autoplay}&controls=1&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0`;
        }

        private get showVideo(): boolean {
            return Boolean(this.series?.previewVideos[Hoster.YOUTUBE]) && !this.videoFinished;
        }

        public mounted(): void {
            this.fetchPreviewVideoMuteState();
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        @Watch('series')
        private reset(): void {
            this.videoFinished = false;
        }

        @Emit('close-modal')
        private closeModal(): boolean {
            return true;
        }

        private onVideoFinished(): void {
            this.videoFinished = true;
        }

        private toggleMuteState(event: Event): void {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            event.target.blur();
            this.store.dispatch(toggleMutePreviewVideoStateAction());
        }

        private fetchPreviewVideoMuteState(): void {
            this.store.selectBehaviour(getMutePreviewVideoState).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(muteState => this.muteVideo = muteState);
        }
    }
</script>

<style scoped lang="scss">
    @import 'src/styles/variables';

    .video-overlay {
        background: linear-gradient(to top, $gray, transparent 30%);
    }

    .header-height {
        height: 374px;
    }

    .text {
        bottom: 2rem;
        left: 3rem;
    }

    .close-button {
        right: 1rem;
        top: 1rem;
    }

    .mute-button {
        right: 5rem;
        top: 1rem;
    }
</style>
