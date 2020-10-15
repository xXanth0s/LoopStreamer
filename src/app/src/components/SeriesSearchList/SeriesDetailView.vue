<template>
    <b-collapse class="mt-1 mb-2 px-0" v-model="isExpanded">
        <div class="accordion-content full-height">
            <div v-if="!loadingSeriesData && seriesData" class="full-height flex-container">
                <div class="content-container">
                    <div class="content-description p-3">{{seriesData.description}}</div>
                    <div class="content-series-items mb-3 ml-4">
                        <div class="px-3 mt-1 flex-center white-tile">
                            <b>Staffeln:</b>
                        </div>
                        <div class="mt-1 series-item flex-center white-tile"
                             v-for="season in seasons"
                             @click="seasonClicked(season)"
                             :class="{selected: isSeasonSelected(season), disabled: isSeasonLoading}"
                             v-bind:key="season.key">
                            <div v-if="season.key !== loadingSeason">
                                {{season.seasonNumber}}
                            </div>
                            <div v-else class="spinner-border tile-spinner" role="status">
                                <span class="sr-only"></span>
                            </div>
                        </div>
                    </div>
                    <div class="content-series-items mb-3 ml-4" v-if="episodes.length">
                        <span class="px-3 mt-1 flex-center white-tile">
                            <b>Episoden:</b>
                        </span>
                        <div class="mt-1 series-item flex-center white-tile"
                             v-for="episode in episodes"
                             @click="episodeClicked(episode)"
                             :class="{selected: isEpisodeSelected(episode), disabled: isEpisodeLoading}"
                             v-bind:key="episode.key">
                            <div v-if="episode.key !== loadingEpisode">
                                {{episode.episodeNumber}}
                            </div>
                            <div v-else class="spinner-border tile-spinner" role="status">
                                <span class="sr-only"></span>
                            </div>
                        </div>
                    </div>

                    <div v-if="loadingEpisodeData" class="flex-center my-3">
                        <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
                            <span class="sr-only"></span>
                        </div>
                        <span class="mt-2">Staffel wird geladen...</span>
                    </div>
                </div>
                <div class="cover float-right mx-3">
                    <img :src="seriesData.posterHref">
                </div>
            </div>
            <div v-if="loadingSeriesData" class="flex-center full-height">
                <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only"></span>
                </div>
                <span>Serie wird geladen...</span>
            </div>
        </div>
    </b-collapse>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Prop, Watch } from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import { takeUntil } from 'rxjs/operators';
    import Series from '../../../../store/models/series.model';
    import { optionsContainer } from '../../container/container';
    import { StoreService } from '../../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { MessageService } from '../../../../shared/services/message.service';
    import { SeriesSeason } from '../../../../store/models/series-season.model';
    import { getSeriesSeasonsByKeys } from '../../../../store/selectors/series-season.selector';
    import {
        createGetSeriesEpisodesForSeasonMessage,
        createGetSeriesInformationFromPortalMessage,
        createStartEpisodeMessage,
    } from '../../../../browserMessages/messages/background.messages';
    import { PORTALS } from '../../../../store/enums/portals.enum';
    import { SeriesMetaViewModel } from '../../models/series-meta-view.model';
    import SeriesEpisode from '../../../../store/models/series-episode.model';
    import { getActiveEpisode } from '../../../../store/selectors/control-state.selector';
    import { Subject } from 'rxjs';


    @Component({
        name: 'series-detail-view',
    })
    export default class SeriesDetailView extends Vue {

        private readonly takeUntil$ = new Subject();

        @Prop(Object)
        private seriesMetaInfo: SeriesMetaViewModel;

        @Prop(Boolean)
        private isExpanded: boolean;

        @Prop(String)
        private selectedProtal: PORTALS;

        private messageService: MessageService;
        private store: StoreService;

        private seriesData: Series = null;
        private seasons: SeriesSeason[] = [];
        private episodes: SeriesEpisode[] = [];
        private loadingSeriesData = false;
        private loadingEpisodeData = false;
        private selectedSeason: SeriesSeason = null;
        private selectedEpisode: SeriesEpisode['key'] = null;
        private loadingEpisode: string = null;
        private loadingSeason: string = null;

        private get isSeasonLoading(): boolean {
            return Boolean(this.loadingSeason);
        }

        private get isEpisodeLoading(): boolean {
            return Boolean(this.loadingEpisode);
        }

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }

        public mounted(): void {
            this.setSelectedEpisode();
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        @Watch('seriesMetaInfo', { immediate: true })
        public async loadSeriesData(seriesMetaInfo: SeriesMetaViewModel): Promise<void> {
            if (seriesMetaInfo) {
                this.loadingSeriesData = true;
                this.seriesData = null;
                this.episodes = [];
                const message = createGetSeriesInformationFromPortalMessage(seriesMetaInfo);
                this.seriesData = await this.messageService.sendMessageToBackground(message);
                this.seasons = this.store.selectSync(getSeriesSeasonsByKeys, this.seriesData.seasons);
                this.loadingSeriesData = false;
            }
        }

        public async seasonClicked(season: SeriesSeason): Promise<void> {
            if (season.key !== this.selectedSeason?.key) {
                this.loadingEpisodeData = true;

                this.selectedSeason = season;
                this.episodes = [];
                this.loadingSeason = season.key;

                const message = createGetSeriesEpisodesForSeasonMessage(this.selectedProtal, season.key);
                this.episodes = await this.messageService.sendMessageToBackground(message);
                this.loadingSeason = null;

                this.loadingEpisodeData = false;
            }
        }

        public async episodeClicked(episode: SeriesEpisode): Promise<void> {
            if (this.isEpisodeLoading) {
                return;
            }
            this.loadingEpisode = episode.key;

            await this.messageService.sendMessageToBackground(createStartEpisodeMessage(episode.key, this.selectedProtal));

            this.loadingEpisode = null;
        }

        private setSelectedEpisode(): void {
            this.store.select(getActiveEpisode).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(activeEpisode => this.selectedEpisode = activeEpisode);
        }

        private isSeasonSelected(season: SeriesSeason): boolean {
            return this.selectedSeason?.key === season.key;
        }

        private isEpisodeSelected(episode: SeriesEpisode): boolean {
            return this.selectedEpisode === episode.key;
        }
    }
</script>

<style lang="scss" scoped>

    @import "src/styles/variables";

    $accordionHeight: 300px;

    .flex-center {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .flex-container {
        display: flex;
    }

    .content-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    .full-height {
        height: 100%;
    }

    .accordion-content {
        min-height: $accordionHeight;
        background-color: $black-color;
        color: white;
        border-radius: 3px;
    }

    .cover {
        align-items: center;
        display: flex;

        img {
            height: $accordionHeight;
        }
    }

    .content-description {
        flex: 1;
        width: 100%;
        min-height: 200px;
    }

    .card-body {
        padding-top: 4px;
        padding-bottom: 4px;
    }

    .content-series-items {
        display: flex;
        overflow: hidden;
        flex-wrap: wrap;

        span {
        }
    }

    .white-tile {
        height: 40px;
        color: black;
        background-color: white;
    }

    .series-item {
        cursor: pointer;

        &:hover, &.selected {
            background-color: $primary-color;
        }

        &.disabled {
            cursor: not-allowed;
        }

        min-width: 35px;
    }

    .tile-spinner {
        height: 18px;
        width: 18px;
    }

</style>
