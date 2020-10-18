<template>
    <div>
        <div class="content-block">
            <h2>Meine Serien</h2>
            <div class="description px-2 py-4">
                <span>Hier sind alle bereits gestreamten Serie aufgelistet und fortgesetzt werden.</span>
                <span>Ebenso können die Zeiten für das Intro und Outro neu definiert werden.</span>
            </div>

            <div v-if="series.length" class="row">
                <series-panel :series-key="serie.key"
                              v-bind:key="serie.key"
                              class="mb-3 col-12 col-md-6 col-lg-4"
                              v-for="serie in series"></series-panel>
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
    import SeriesPanel from '../components/SeriesPanel.vue';
    import { StoreService } from '../../../shared/services/store.service';
    import { optionsContainer } from '../container/container';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';

    @Component({
        components: {
            SeriesPanel,
        },
    })
    export default class MySeriesPage extends Vue {
        private store: StoreService;
        private series: Series[] = [];

        private readonly takeUntil$ = new Subject();

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
        }

        public mounted(): void {
            this.store.selectBehaviour(getAllWatchedSeries).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(series => this.series = series);
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }
    }
</script>
