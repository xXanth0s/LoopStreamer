<template>
    <div class="relative">
        <search-input class="absolute searchInput" @inputChanged="searchTextChanged"/>
        <div v-if="searchText.length === 0">
            <series-carousel v-for="collection in collections"
                             class="-mx-4"
                             :key="collection.key"
                             :language="language"
                             :series-collection="collection"
                             @seriesClicked="seriesSelected"/>
        </div>
        <series-search-result v-else
                              class="pt-4"
                              :language="language"
                              :search-result="searchCollection"
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
    import SeriesPanelFront from '../components/SeriesOverview/SeriesPanelFront.vue';
    import { NamedCollection } from '../../../store/models/collection.model';
    import { Series } from '../../../store/models/series.model';
    import { getCollectionsForTypes } from '../../../store/selectors/app-control-state.selector';
    import SeriesCarousel from '../components/SeriesOverview/SeriesCarousel.vue';
    import { LANGUAGE } from '../../../store/enums/language.enum';
    import { setSearchTextAction, setSelectedSeriesAction } from '../../../store/reducers/app-control-state.reducer';
    import SeriesModal from '../components/SeriesOverview/SeriesModal/SeriesModal.vue';
    import { SeriesMetaInfo } from '../../../store/models/series-meta-info.model';
    import { CollectionType } from '../../../store/enums/collection-key.enum';
    import SearchInput from '../components/Shared/SearchInput.vue';
    import { SERIES_DASHBOARD_COLLECTION_TYPES } from '../../../constants/collections-types.const';
    import SeriesSearchResult from '../components/SeriesOverview/SeriesSearchResult.vue';

    @Component({
        name: 'test-page',
        components: {
            SeriesSearchResult,
            SearchInput,
            SeriesModal,
            SeriesCarousel,
            SeriesPanelFront,
        },
    })
    export default class SeriesPage extends Vue {
        $refs!: {
            seriesModal: SeriesModal;
        };
        private readonly takeUntil$ = new Subject();
        private language: LANGUAGE = LANGUAGE.GERMAN;
        private searchText = '';
        private collections: NamedCollection<SeriesMetaInfo>[] = [];
        private searchCollection: NamedCollection<SeriesMetaInfo> = null;

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        public mounted() {
            this.fetchCollectionsFromStore();
            this.fetchSearchCollectionsFromStore();
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        private fetchCollectionsFromStore(): void {
            this.store.selectBehaviour(getCollectionsForTypes, SERIES_DASHBOARD_COLLECTION_TYPES).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(data => this.collections = data);
        }

        private fetchSearchCollectionsFromStore(): void {
            this.store.selectBehaviour(getCollectionsForTypes, [ CollectionType.SEARCH_RESULT_SERIES ]).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(collections => this.searchCollection = collections[0] || null);
        }

        private seriesSelected(seriesKey: Series['key']): void {
            this.store.dispatch(setSelectedSeriesAction({ selectedSeriesKey: seriesKey }));

            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            this.$refs.seriesModal.openModal(seriesKey);
        }

        private searchTextChanged(searchText: string): void {
            this.searchText = searchText;
            this.store.dispatch(setSearchTextAction({ searchText }));
        }
    }
</script>

<style lang="scss">

    .searchInput {
        top: -1rem;
        right: 0;
    }
</style>
