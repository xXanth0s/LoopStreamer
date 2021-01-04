<template>
    <div class="ls-container ls-on-top">
        <div v-if="episode && series">
            <transition name="fade">
                <div v-if="showOverlay" class="ls-video-overlay">

                    <div class="text">
                        <div class="series-title">
                            {{series.titles[language]}}
                        </div>
                        <div class="episode-title">
                            {{title}}
                        </div>
                    </div>
                </div>
            </transition>

        </div>
    </div>
</template>

<script lang="ts">
    // eslint-disable-next-line import/no-extraneous-dependencies
    import { fromEvent } from 'rxjs';
    import { debounceTime, tap } from 'rxjs/operators';

    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';
    import { StoreService } from '../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
    // eslint-disable-next-line import/no-cycle
    import { inversifyContentContainer } from '../../container/container';
    import { SeriesEpisode } from '../../../store/models/series-episode.model';
    import { environment } from '../../../environments/environment';
    import { getSeriesEpisodeByKey } from '../../../store/selectors/series-episode.selector';
    import { Series } from '../../../store/models/series.model';
    import { getSeriesForEpisode } from '../../../store/selectors/series.selector';
    import { getDefaultLanguage } from '../../../store/selectors/options.selector';
    import { LANGUAGE } from '../../../store/enums/language.enum';
    import { getSeriesEpisodeTitle } from '../../../store/utils/series.utils';

    @Component({
        name: 'ls-video-overlay',
    })
    export default class VideoOverlayComponent extends Vue {
        private readonly store: StoreService = inversifyContentContainer.get(SHARED_TYPES.StoreService);

        @Prop(String)
        private episodeKey: SeriesEpisode['key'];

        private series: Series = null;

        private showOverlay = true;
        private episode: SeriesEpisode = null;
        private language: LANGUAGE = LANGUAGE.NONE;

        public get title(): string {
            return getSeriesEpisodeTitle(this.episode);
        }

        public mounted(): void {
            setTimeout(() => this.showOverlay = false, environment.videoButtonVisibilityTime);

            this.initMouseEventListeners();
            this.fetchSeriesInfoFromStore();
        }

        private initMouseEventListeners(): void {
            fromEvent(document.body, 'mousemove').pipe(
                tap(() => this.showOverlay = true),
                debounceTime(environment.videoButtonVisibilityTime),
            ).subscribe(() => this.showOverlay = false);
        }

        private fetchSeriesInfoFromStore(): void {
            this.language = this.store.selectSync(getDefaultLanguage);
            this.episode = this.store.selectSync(getSeriesEpisodeByKey, this.episodeKey);
            this.series = this.store.selectSync(getSeriesForEpisode, this.episodeKey);
        }
    }
</script>
