<template>
    <div>
        <series-carousel v-for="collection in collections"
                         :key="collection.key"
                         :language="language"
                         :series-collection="collection"
                         @seriesClicked="seriesSelected"/>

        <series-modal ref="seriesModal"/>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Inject } from 'vue-property-decorator';
    import { StoreService } from '../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
    import SeriesPanelFront from '../components/MySeries/SeriesPanelFront.vue';
    import { NamedCollection } from '../../../store/models/collection.model';
    import Series from '../../../store/models/series.model';
    import { getSeriesCollections } from '../../../store/selectors/app-control-state.selector';
    import SeriesCarousel from '../components/SeriesOverview/SeriesCarousel.vue';
    import { LANGUAGE } from '../../../store/enums/language.enum';
    import { setSelectedSeriesAction } from '../../../store/reducers/app-control-state.reducer';
    import SeriesModal from '../components/SeriesOverview/SeriesModal/SeriesModal.vue';

    @Component({
        name: 'test-page',
        components: {
            SeriesModal,
            SeriesCarousel,
            SeriesPanelFront,
        },
    })
    export default class HomePage extends Vue {

        private readonly seriesModalId = 'series-modal';

        private language: LANGUAGE = LANGUAGE.GERMAN;
        private collections: NamedCollection<Series>[] = [];

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        $refs!: {
            seriesModal: SeriesModal;
        };

        public mounted() {
            this.loadSeriesData();
        }

        private loadSeriesData(): void {
            this.store.selectBehaviour(getSeriesCollections).subscribe(data => this.collections = data);
        }

        private seriesSelected(seriesKey: Series['key']): void {
            this.store.dispatch(setSelectedSeriesAction({ selectedSeriesKey: seriesKey }));

            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            this.$refs.seriesModal.openModal(seriesKey);
        }
    }
</script>
