<template>
    <div>
        <div class="content-block">
            <h2>Meine Serien</h2>
            <div class="description">
                <span>Sobald eine Serie mithilfe des LoopStreamers gestreamt wurde, wird sie hier gelistet.</span>
                <span>Hier können auch die Zeiten für Intro und Outro individuell eingestellt werden</span>
            </div>

            <div class="row portal-selector">
                <div class="col-sm-12">
                    <div>
                        <el-collapse>
                            <el-collapse-item title="Verfügbare Streamingportale" name="1">
                                <ul>
                                    <li v-for="portal in portals" v-bind:key="portal.key">
                                        <a :href="portal.baseUrl">{{portal.name}}</a>
                                    </li>
                                </ul>
                            </el-collapse-item>
                        </el-collapse>
                    </div>
                </div>
            </div>
            <div v-if="series.length" class="row">
                <series-panel v-for="(serie, index) in series"
                              v-bind:key="serie.key"
                              :index="index" :series="serie"
                              v-on:remove="onRemoveSeries"
                              v-on:save="onSaveSeries"
                              v-on:reset="onResetSeries"></series-panel>
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
    import { Notification } from 'element-ui';
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Subject } from 'rxjs';
    import { takeUntil } from 'rxjs/operators';
    import { removeSeriesAction, resetSeriesAction, updateSeriesAction } from '../../../store/reducers/series.reducer';
    import { getAllSeries } from '../../../store/selectors/series.selector';
    import { getAllPortals } from '../../../store/selectors/portals.selector';
    import messages from '../../constants/messages';
    import Series from '../../../store/models/series.model';
    import Portal from '../../../store/models/portal.model';
    import SeriesPanel from '../components/SeriesPanel.vue';
    import { StoreService } from '../../../shared/services/store.service';
    import { optionsContainer } from '../container/container';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';

    @Component({
        components: {
            SeriesPanel,
        },
    })
    export default class SeriesPage extends Vue {
        private store: StoreService;
        private series: Series[] = [];
        private portals: Portal[] = [];

        private readonly takeUntil$ = new Subject();

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
        }

        public mounted(): void {
            this.store.selectBehaviour(getAllSeries).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(series => this.series = series);

            this.store.selectBehaviour(getAllPortals).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(portals => this.portals = portals);
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        public onSaveSeries(series: Series): void {
            this.store.dispatch(updateSeriesAction(series));
            Notification.success({
                title: messages.savingTitle,
                message: messages.savingText,
                offset: 60,
            });
        }

        public onRemoveSeries(series: Series): void {
            this.store.dispatch(removeSeriesAction(series.key));
            Notification.success({
                title: messages.deleteTitle,
                message: messages.deleteTitle,
                offset: 60,
            });
        }

        public onResetSeries(series: Series): void {
            this.store.dispatch(resetSeriesAction(series.key));
            Notification.success({
                title: messages.resetTitle,
                message: messages.resetText,
                offset: 0,
            });
        }
    }
</script>
