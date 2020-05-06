<template>

    <b-collapse class="my-2" v-model="isExpanded">
        <div class="accordion-content">
            <div v-if="!loadSeriesData" class="full-height">
                <div class="row">
                    <div class="col-8">
                        <div class="col-2" v-for="season in seasons" v-bind:key="season.key">
                            <b-card class="flex-center">
                                Staffel {{season.seasonNumber}}
                            </b-card>
                        </div>
                    </div>
                    <div class="col-4">
                        <img :src="seriesData.posterHref">
                    </div>
                </div>
            </div>
            <div v-if="loadSeriesData" class="flex-center full-height">
                <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        </div>
    </b-collapse>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Prop } from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import Series from '../../../../store/models/series.model';
    import { optionsContainer } from '../../container/container';
    import { StoreService } from '../../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { MessageService } from '../../../../shared/services/message.service';
    import { SeriesSeason } from '../../../../store/models/series-season.model';
    import { getSeriesSeasonByKey, getSeriesSeasonsByKeys } from '../../../../store/selectors/series-season.selector';
    import {
        createGetSeriesEpisodesForSeasonMessage,
        createGetSeriesInformationFromPortalMessage,
    } from '../../../../browserMessages/messages/background.messages';
    import { PORTALS } from '../../../../store/enums/portals.enum';
    import { SeriesMetaViewModel } from '../../models/series-meta-view.model';


    @Component({
        name: 'series-detail-view',
    })
    export default class SeriesDetailView extends Vue {
        @Prop(Object)
        private set seriesMetaInfo(seriesMetaInfo: SeriesMetaViewModel) {
            this.loadSeriesData(seriesMetaInfo);
        }

        private get seriesMetaInfo() {
            return null;
        }

        @Prop(Boolean)
        private isExpanded = false;

        private messageService: MessageService;
        private store: StoreService;
        private seriesData: Series;
        private seasons: SeriesSeason[];
        private loadingSeriesData = false;

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }

        public async loadSeriesData(seriesMetaInfo: SeriesMetaViewModel): Promise<void> {
            this.loadingSeriesData = true;
            const message = createGetSeriesInformationFromPortalMessage(seriesMetaInfo);
            this.seriesData = await this.messageService.sendMessageToBackground(message);
            this.seasons = this.store.selectSync(getSeriesSeasonsByKeys, this.seriesData.seasons);
            this.loadingSeriesData = false;
        }

        public loadSeriesSeason(seasonKey: string): SeriesSeason {
            return this.store.selectSync(getSeriesSeasonByKey, seasonKey);
        }

        public async seasonClicked(seasonKey: string): Promise<void> {
            const data = this.messageService.sendMessageToBackground(createGetSeriesEpisodesForSeasonMessage(PORTALS.BS, seasonKey));
            console.log(data);
        }
    }
</script>


<style lang="scss" scoped>
    .flex-center {
        display: flex;
        justify-content: center;
        align-items:center;
    }

    .full-height {
        height: 100%;
    }

    .accordion-content {
        height: 220px;
        background-color: #2c2c2c;
    }
</style>
