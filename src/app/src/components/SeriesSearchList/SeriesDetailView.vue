<template>
    <b-collapse class="mt-1 mb-2 px-0" v-model="isExpanded">
        <div class="accordion-content full-height">
            <div v-if="!loadingSeriesData && seriesData" class="full-height flex-container">
                <div class="content-container">
                    <div class="content-description p-3">{{seriesData.description}}</div>
                    <div class="content-series-items mb-3 ml-4">
                        <span class="py-2 px-3 mt-1">
                            <b>Staffeln:</b>
                        </span>
                        <span class="py-2 px-3 mt-1 series-item"
                              v-for="season in seasons"
                              @click="seasonClicked(season)"
                              :class="{selected: isSeasonSelected(season)}"
                              v-bind:key="season.key">
                            {{season.seasonNumber}}
                        </span>
                    </div>
                    <div class="content-series-items mb-3 ml-4" v-if="episodes.length">
                        <span class="py-2 px-3 mt-1">
                            <b>Episoden:</b>
                        </span>
                        <span class="py-2 px-3 mt-1 series-item"
                              v-for="episode in episodes"
                              @click="episodeClicked(episode)"
                              v-bind:key="episode.key">
                            {{episode.episodeNumber}}
                        </span>
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


    @Component({
        name: 'series-detail-view',
    })
    export default class SeriesDetailView extends Vue {

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

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
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

                const message = createGetSeriesEpisodesForSeasonMessage(this.selectedProtal, season.key);
                this.episodes = await this.messageService.sendMessageToBackground(message);

                this.loadingEpisodeData = false;
            }
        }

        public async episodeClicked(episode: SeriesEpisode): Promise<void> {
            this.messageService.sendMessageToBackground(createStartEpisodeMessage(episode.key, this.selectedProtal));
        }

        private isSeasonSelected(season: SeriesSeason): boolean {
            return this.selectedSeason?.key === season.key;
        }
    }
</script>

<style lang="scss" scoped>

    @import "styles/variables";

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
            color: black;
            background-color: white;
        }
    }

    .series-item {
        cursor: pointer;

        &:hover, &.selected {
            background-color: $primary-color;
        }
    }

</style>
