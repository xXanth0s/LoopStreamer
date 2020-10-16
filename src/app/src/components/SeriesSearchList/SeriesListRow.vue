<template>
    <div>
        <div class="row">
            <series-tile class="col-4"
                         v-for="series in seriesList"
                         v-bind:key="series.key"
                         v-bind:series="series"
                         @tile-clicked="seriesSelected">
            </series-tile>
        </div>
        <div class="row">
            <series-detail-view
                    :series-key="openSeriesKey"
                    :isExpanded="isAnySeriesSelected"
                    :selected-protal="selectedProtal"
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
    import { setExpandedSeriesOptionsPageAction } from '../../../../store/reducers/control-state.reducer';
    import SeriesTile from './SeriesTile.vue';
    import { isAnySeriesExpandedOnOptionsPage } from '../../../../store/selectors/control-state.selector';
    import SeriesDetailView from './SeriesDetailView.vue';
    import { PORTALS } from '../../../../store/enums/portals.enum';
    import Series from '../../../../store/models/series.model';

    @Component({
        name: 'series-list-row',
        components: {
            SeriesTile,
            SeriesDetailView,
        },
    })
    export default class SeriesListRow extends Vue {
        private readonly takeUntil$ = new Subject();

        @Prop(Array)
        private seriesList: Series[];

        @Prop(String)
        private selectedProtal: PORTALS;

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

        public async seriesSelected(seriesKey: Series['key']): Promise<void> {
            this.store.dispatch(setExpandedSeriesOptionsPageAction(seriesKey));
            this.openSeriesKey = seriesKey;
        }

        @Watch('seriesList', { immediate: true })
        public initializeSeriesList(seriesList: Series[]): void {
            const keys = seriesList.map(series => series.key);
            this.store.select(isAnySeriesExpandedOnOptionsPage, keys).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isAnySeriesSelected => {
                if (!isAnySeriesSelected) {
                    this.openSeriesKey = null;
                }
                this.isAnySeriesSelected = isAnySeriesSelected;
            });
        }
    }
</script>
