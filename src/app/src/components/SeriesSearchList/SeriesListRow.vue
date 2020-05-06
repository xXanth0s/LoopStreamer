<template>
    <div>
        <div class="row">
            <series-tile class="col-4"
                         v-for="series in seriesList"
                         v-bind:key="series.key"
                         v-bind:series="series"
                         @click="test()">
            </series-tile>
        </div>
        <div class="row">
            <series-detail-view :seriesMetaInfo="openSeries" :isExpanded="isAnySeriesSelected" class="col">
            </series-detail-view>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Prop } from 'vue-property-decorator';
    import Component from 'vue-class-component';
    import { takeUntil } from 'rxjs/operators';
    import { Subject } from 'rxjs';
    import { optionsContainer } from '../../container/container';
    import { StoreService } from '../../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { MessageService } from '../../../../shared/services/message.service';
    import { setExpandedSeriesOptionsPageAction } from '../../../../store/reducers/control-state.reducer';
    import { SeriesMetaViewModel } from '../../models/series-meta-view.model';
    import SeriesTile from './SeriesTile.vue';
    import { isAnySeriesExpandedOnOptionsPage } from '../../../../store/selectors/control-state.selector';
    import SeriesDetailView from './SeriesDetailView.vue';


    @Component({
        name: 'series-list-row',
        components: {
            SeriesTile,
            SeriesDetailView
        },
    })
    export default class SeriesListRow extends Vue {
        private readonly takeUntil$ = new Subject();

        @Prop(Object)
        private seriesList: SeriesMetaViewModel[];

        private openSeries: SeriesMetaViewModel = null;
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

        public test() {
            console.log('test')
        }

        public async seasonSelected(seriesMetaInfo: SeriesMetaViewModel): Promise<void> {
            console.log('seasonSelected', seriesMetaInfo)
            this.store.dispatch(setExpandedSeriesOptionsPageAction(seriesMetaInfo.key));
            this.openSeries = seriesMetaInfo;
        }

        public mounted(): void {
            console.log( this.seriesList);
            const keys = this.seriesList.map(series => series.key);
            this.store.selectBehaviour(isAnySeriesExpandedOnOptionsPage, keys).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isAnySeriesSelected => {
                if (!isAnySeriesSelected) {
                    this.openSeries = null;
                }
                this.isAnySeriesSelected = isAnySeriesSelected;
            });
        }
    }
</script>
