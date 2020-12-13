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
            <div v-else>
                <div class="spinner text-center pt-3" v-if="showSpinner">
                    <div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
                <div v-else>
                    <div class="row">
                        <div class="col">
                            <b-form-input v-model="searchText" placeholder="Nach Serie suchen"></b-form-input>
                        </div>
                    </div>

                    <series-list-row
                            class="px-3"
                            v-for="seriesChunk in filteredSeries"
                            :key="seriesChunk[0].title"
                            :series-list="seriesChunk">
                    </series-list-row>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Watch } from 'vue-property-decorator';
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { takeUntil } from 'rxjs/operators';
    import { merge, Subject } from 'rxjs';
    import Portal from '../../../store/models/portal.model';
    import { optionsContainer } from '../container/container';
    import { StoreService } from '../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
    import { getAllPortals } from '../../../store/selectors/portals.selector';
    import { PORTALS } from '../../../store/enums/portals.enum';
    import SeriesTile from '../components/SeriesSearchList/SeriesTile.vue';
    import SeriesListRow from '../components/SeriesSearchList/SeriesListRow.vue';
    import { getSeriesForPortal } from '../../../store/selectors/series.selector';
    import Series from '../../../store/models/series.model';
    import { convertArrayToChunks, sortArrayForKey } from '../../../utils/array.utils';
    import {
        resetAppControlStateAction,
        setActivePortalForAppAction,
    } from '../../../store/reducers/app-control-state.reducer';
    import { LANGUAGE } from '../../../store/enums/language.enum';

    @Component({
        name: 'series-overview',
        components: {
            SeriesTile,
            SeriesListRow,
        },
    })
    export default class SeriesOverview extends Vue {
        private readonly seriesTilesPerRow = 3;
        private readonly takeUntil$ = new Subject();
        private readonly portalChanged$ = new Subject();

        private store: StoreService;

        private portals: Portal[] = [];
        private filteredSeries: Series[][] = [];
        private series: Series[];

        private selectedPortal: PORTALS = null;
        private searchText = '';

        public get showSpinner(): boolean {
            return !this.series.length && this.selectedPortal === null;
        }

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
        }

        public mounted(): void {
            this.portals = this.store.selectSync(getAllPortals);
            this.store.dispatch(resetAppControlStateAction());
        }

        @Watch('selectedPortal')
        public async loadSeries(portal: PORTALS): Promise<void> {
            this.store.dispatch(setActivePortalForAppAction(portal));
            this.loadSeriesFromStoreForPortal(portal);
        }

        @Watch('searchText')
        public filterSeries(): void {
            let filteredSeries: Series[];
            if (this.searchText) {
                filteredSeries = this.series.filter(serie => serie.titles[LANGUAGE.GERMAN].toLowerCase().includes(this.searchText.toLowerCase()));
            } else {
                filteredSeries = this.series;
            }

            const sortedArray = sortArrayForKey(filteredSeries, (val: Series) => val.titles[LANGUAGE.GERMAN].toLowerCase());

            this.filteredSeries = convertArrayToChunks(sortedArray, this.seriesTilesPerRow).slice(0, 100);
        }

        private loadSeriesFromStoreForPortal(portal: PORTALS): void {
            this.series = [];
            this.portalChanged$.next();
            this.store.selectBehaviour(getSeriesForPortal, portal).pipe(
                takeUntil(merge(this.takeUntil$, this.portalChanged$)),
            ).subscribe(series => {
                this.series = series;
                this.filterSeries();
            });
        }
    }

</script>
