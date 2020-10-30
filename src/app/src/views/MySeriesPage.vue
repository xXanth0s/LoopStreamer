<template>
    <div>
        <div class="content-block">
            <h2>Meine Serien</h2>
            <div class="description px-2 py-4">
                <span>Hier sind alle bereits gestreamten Serie aufgelistet und fortgesetzt werden.</span>
                <span>Ebenso können die Zeiten für das Intro und Outro neu definiert werden.</span>
            </div>

            <div v-if="series">
                <my-series-row :key="index"
                               :series-list="seriesChunk"
                               v-for="(seriesChunk, index) in series">
                </my-series-row>
            </div>
            <div v-else>

                <div class="cont-box">
                    <div class="row col-row">
                        <div class="center">
                            Es sind noch keine Serien gespeichert
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Subject } from 'rxjs';
    import { takeUntil } from 'rxjs/operators';
    import { getAllWatchedSeries } from '../../../store/selectors/series.selector';
    import Series from '../../../store/models/series.model';
    import SeriesPanel from '../components/MySeries/SeriesPanel.vue';
    import { StoreService } from '../../../shared/services/store.service';
    import { optionsContainer } from '../container/container';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
    import { convertArrayToChunks } from '../../../utils/array.utils';
    import SeriesListRow from '../components/SeriesSearchList/SeriesListRow.vue';
    import MySeriesRow from '../components/MySeries/MySeriesRow.vue';
    import { toggleSelectedSeriesForAppAction } from '../../../store/reducers/app-control-state.reducer';

    @Component({
        components: {
            MySeriesRow,
            SeriesListRow,
            SeriesPanel,
        },
    })
    export default class MySeriesPage extends Vue {
        private store: StoreService;
        private series: Series[][] = [];

        private readonly takeUntil$ = new Subject();

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
        }

        public mounted(): void {
            this.store.selectBehaviour(getAllWatchedSeries).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(series => {
                this.series = convertArrayToChunks(series, 3);
            });

            this.store.dispatch(toggleSelectedSeriesForAppAction(null));
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        public getKeyForChunk(seriesChunk: Series[]): string {
            return `${seriesChunk[0]?.key || ''}-${seriesChunk[1]?.key || ''}-${seriesChunk[2]?.key || ''}`;
        }
    }
</script>
