<template>
    <div class="mb-2">
        <div class="row">
            <series-panel :series-key="serie.key"
                          class="mb-1 col-4"
                          v-bind:key="serie.key"
                          v-for="serie in seriesList"></series-panel>
        </div>
        <div class="row">
            <series-detail-view
                    :isExpanded="isAnySeriesSelected"
                    :series-key="openSeriesKey"
                    class="col">
            </series-detail-view>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Prop, Watch } from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import { takeUntil } from 'rxjs/operators';
    import { Subject } from 'rxjs';
    import { optionsContainer } from '../../container/container';
    import { StoreService } from '../../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { MessageService } from '../../../../shared/services/message.service';
    import Series from '../../../../store/models/series.model';
    import SeriesPanel from './SeriesPanel.vue';
    import SeriesDetailView from '../SeriesSearchList/SeriesDetailView.vue';
    import { getExpandedSeries } from '../../../../store/selectors/app-control-state.selector';

    @Component({
        name: 'my-series-row',
        components: {
            SeriesDetailView,
            SeriesPanel,
        },
    })
    export default class MySeriesRow extends Vue {
        private readonly takeUntil$ = new Subject();

        @Prop(Array)
        private seriesList: Series[];

        private openSeriesKey: Series['key'] = null;
        private isAnySeriesSelected = false;
        private messageService: MessageService;
        private store: StoreService;

        public destroyed(): void {
            this.takeUntil$.next();
        }

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }

        @Watch('seriesList', { immediate: true })
        public initializeSeriesList(seriesList: Series[]): void {
            const keys = seriesList.map(series => series.key);
            this.store.select(getExpandedSeries).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(expandedSeries => {
                this.isAnySeriesSelected = keys.some(key => key === expandedSeries);
                if (!this.isAnySeriesSelected) {
                    this.openSeriesKey = null;
                } else {
                    this.openSeriesKey = expandedSeries;
                }
            });
        }
    }
</script>
