<template>
    <div>
        <div class="content-block">
            <h2>LoopStreamer Beta Version</h2>
            Portal auswählen
            <div class="row">
                <div class="col">
                    <b-form-select v-model="selectedPortal" class="mb-3">
                        <b-form-select-option v-for="portal in portals" v-bind:key="portal.key" :value="portal.key">
                            {{portal.name}}
                        </b-form-select-option>
                    </b-form-select>
                </div>
            </div>
            <div class="card" v-if="!selectedPortal">
                <div class="card-body text-center">
                    Bitte Portal auswählen, auf dem nach Serien gesucht werden soll
                </div>
            </div>
            <div class="spinner text-center pt-3" v-if="showSpinner">
                <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
            <div v-if="selectedPortal && !showSpinner">
                <div class="row">
                    <div class="col">
                        <b-form-input v-model="searchText" placeholder="Nach Serie suchen"></b-form-input>
                    </div>
                </div>

                <series-list-row
                        class="px-3"
                        v-for="seriesChunk in filteredSeries"
                        :key="seriesChunk[0].title"
                        :series-list="seriesChunk"
                        :selected-protal="selectedPortal">
                </series-list-row>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Watch } from 'vue-property-decorator';
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import Portal from '../../../store/models/portal.model';
    import { optionsContainer } from '../container/container';
    import { StoreService } from '../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
    import { getAllPortals } from '../../../store/selectors/portals.selector';
    import { MessageService } from '../../../shared/services/message.service';
    import { PORTALS } from '../../../store/enums/portals.enum';
    import { createGetAllAvailableSeriesFromPortalMessage } from '../../../browserMessages/messages/background.messages';
    import { SeriesMetaInfoDto } from '../../../dto/series-meta-info.dto';
    import SeriesTile from '../components/SeriesSearchList/SeriesTile.vue';
    import { SeriesMetaViewModel } from '../models/series-meta-view.model';
    import { getKeyForSeriesTitle } from '../../../store/utils/key.utils';
    import SeriesListRow from '../components/SeriesSearchList/SeriesListRow.vue';
    import { allSeriesMock } from '../mocks/all-series.mock';

    @Component({
        name: 'welcome-page',
        components: {
            SeriesTile,
            SeriesListRow,
        },
    })
    export default class WelcomePage extends Vue {
        private readonly seriesTilesPerRow = 3;

        private store: StoreService;
        private messageService: MessageService;
        private portals: Portal[] = [];
        private filteredSeries: SeriesMetaInfoDto[][] = [];
        private selectedPortal: PORTALS = null;
        private series: SeriesMetaViewModel[];
        private showSpinner = false;
        private searchText = '';

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }

        public mounted(): void {
            this.portals = this.store.selectSync(getAllPortals);
        }

        @Watch('selectedPortal')
        public async loadSeries(): Promise<void> {
            const message = createGetAllAvailableSeriesFromPortalMessage(this.selectedPortal);
            this.showSpinner = true;
            try {
                const seriesResult = await this.messageService.sendMessageToBackground(message);
                // const seriesResult = allSeriesMock as SeriesMetaInfoDto[];
                this.series = seriesResult.map(metaInfo => ({
                    ...metaInfo,
                    key: getKeyForSeriesTitle(metaInfo.title),
                })).sort((a, b) => a.title.localeCompare(b.title));

                this.filteredSeries = this.convertSeriesToChunks(this.series).slice(0, 100);
            } catch (e) {
                console.error('Error occured, while loading all seires', e);
            } finally {
                this.showSpinner = false;
            }
        }

        @Watch('searchText')
        public searchChanged(): void {
            const sortedArrays = this.series.filter(serie => serie.title.toLowerCase().includes(this.searchText.toLowerCase()));
            this.filteredSeries = this.convertSeriesToChunks(sortedArrays).slice(0, 100);
        }

        private convertSeriesToChunks(series: SeriesMetaViewModel[]): SeriesMetaViewModel[][] {
            const result = [];
            series.forEach((value, currentIndex) => {
                const index = Math.floor(currentIndex / this.seriesTilesPerRow);
                const previous = result[index] || [];
                result[index] = [
                    ...previous,
                    value,
                ];
            });

            return result;
        }
    }

</script>
