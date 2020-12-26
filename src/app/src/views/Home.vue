<template>
    <div class="relative">
        <search-input class="absolute searchInput" @inputChanged="searchTextChanged"/>
        <series-carousel v-if="watchedSeriesCollection"
                         class="-mx-4"
                         :language="language"
                         :series-collection="watchedSeriesCollection"
                         @seriesClicked="seriesSelected"/>
        <series-carousel v-for="collection in collections"
                         class="-mx-4"
                         :key="collection.key"
                         :language="language"
                         :series-collection="collection"
                         @seriesClicked="seriesSelected"/>

        <series-modal ref="seriesModal" @similarSeriesSelected="seriesSelected"/>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Inject } from 'vue-property-decorator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StoreService } from '../../../shared/services/store.service';
import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
import SeriesPanelFront from '../components/MySeries/SeriesPanelFront.vue';
import { NamedCollection } from '../../../store/models/collection.model';
import Series from '../../../store/models/series.model';
import { getSeriesCollectionsForOverview } from '../../../store/selectors/app-control-state.selector';
import SeriesCarousel from '../components/SeriesOverview/SeriesCarousel.vue';
import { LANGUAGE } from '../../../store/enums/language.enum';
import { setSearchTextAction, setSelectedSeriesAction } from '../../../store/reducers/app-control-state.reducer';
import SeriesModal from '../components/SeriesOverview/SeriesModal/SeriesModal.vue';
import { SeriesMetaInfo } from '../../../store/models/series-meta-info.model';
import { getWatchedSeries } from '../../../store/selectors/watched-series.selector';
import { CollectionKey } from '../../../store/enums/collection-key.enum';
import SearchInput from '../components/Shared/SearchInput.vue';

@Component({
    name: 'test-page',
    components: {
        SearchInput,
        SeriesModal,
        SeriesCarousel,
        SeriesPanelFront,
    },
})
export default class HomePage extends Vue {
    $refs!: {
        seriesModal: SeriesModal;
    };
    private readonly takeUntil$ = new Subject();
    private language: LANGUAGE = LANGUAGE.GERMAN;
    private collections: NamedCollection<SeriesMetaInfo>[] = [];
    private watchedSeriesCollection: NamedCollection<Series> = null;
    @Inject(SHARED_TYPES.StoreService)
    private store: StoreService;

    public mounted() {
        this.fetchCollectionsFromStore();
        this.fetchWatchedSeriesFromStore();
    }

    public destroyed(): void {
        this.takeUntil$.next();
    }

    private fetchCollectionsFromStore(): void {
        this.store.selectBehaviour(getSeriesCollectionsForOverview).pipe(
            takeUntil(this.takeUntil$),
        ).subscribe(data => this.collections = data);
    }

    private fetchWatchedSeriesFromStore(): void {
        this.store.selectBehaviour(getWatchedSeries).pipe(
            takeUntil(this.takeUntil$),
        ).subscribe(watchedSeries => this.setWatchedSeriesCollection(watchedSeries));
    }

    private setWatchedSeriesCollection(watchedSeries: Series['key'][]): void {
        if (watchedSeries.length === 0) {
            this.watchedSeriesCollection = null;
        } else {
            this.watchedSeriesCollection = {
                key: CollectionKey.LAST_WATCHED_SERIES,
                title: 'Zuletzt gesehene Serien',
                data: watchedSeries,
            };
        }
    }

    private seriesSelected(seriesKey: Series['key']): void {
        this.store.dispatch(setSelectedSeriesAction({selectedSeriesKey: seriesKey}));

        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this.$refs.seriesModal.openModal(seriesKey);
    }

    private searchTextChanged(searchText: string): void {
        this.store.dispatch(setSearchTextAction({searchText}));
    }
}
</script>

<style lang="scss">

.searchInput {
    top: -1rem;
    right: 0;
}
</style>
