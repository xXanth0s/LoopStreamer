<template>
    <div>
        <div v-if="isLoading" class="w-full h-80">
            <spinner text="Suchergebnisse werden geladen"/>
        </div>
        <div v-else class="row">
            <series-panel-front class="mb-3 col-xl-1.5 col-lg-2 col-md-3 col-sm-4 col-6 cursor-pointer "
                                v-for="singleSeries in series"
                                :imageUrl="singleSeries.posterHref"
                                :key="singleSeries.key"
                                :series-name="singleSeries.titles[language]"
                                :show-settings-icon="false"
                                @click.native="seriesSelected(singleSeries.key)"/>
        </div>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import {
        Emit, Inject, Prop, Watch,
    } from 'vue-property-decorator';
    import { Subject } from 'rxjs';
    import { debounceTime, takeUntil } from 'rxjs/operators';
    import { NamedCollection } from '../../../../store/models/collection.model';
    import { SeriesMetaInfo } from '../../../../store/models/series-meta-info.model';
    import Spinner from '../Shared/Spinner.vue';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../../shared/services/store.service';
    import { getMultipleSeriesMetaInfos } from '../../../../store/selectors/series-meta-info.selector';
    import { isLoadingSearchResult } from '../../../../store/selectors/async-interaction.selector';
    import SeriesPanelFront from './SeriesPanelFront.vue';
    import { LANGUAGE } from '../../../../store/enums/language.enum';

    @Component({
        name: 'series-search-result',
        components: {
            Spinner,
            SeriesPanelFront,
        },
    })
    export default class SeriesSearchResult extends Vue {
        private readonly takeUntil$ = new Subject();

        private series: SeriesMetaInfo[] = [];
        private isLoadingResult = false;

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        @Prop(Object)
        private searchResult: NamedCollection<SeriesMetaInfo>;

        @Prop(String)
        private language: LANGUAGE;

        private get isLoading(): boolean {
            return !this.searchResult || (this.isLoadingResult && this.series.length === 0);
        }

        public mounted(): void {
            this.fetchLoadingStateFromStore();
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        @Emit('seriesClicked')
        public seriesSelected(seriesKey: SeriesMetaInfo['key']): SeriesMetaInfo['key'] {
            return seriesKey;
        }

        @Watch('searchResult')
        private fetchSeriesFromStore(): void {
            this.series = this.store.selectSync(getMultipleSeriesMetaInfos, this.searchResult.data);
        }

        private fetchLoadingStateFromStore(): void {
            this.store.selectBehaviour(isLoadingSearchResult).pipe(
                takeUntil(this.takeUntil$),
                debounceTime(200),
            ).subscribe(isLoading => this.isLoadingResult = isLoading);
        }
    }
</script>

<style scoped lang="scss">

    @media (min-width: 1380px) {
        .col-xl-1\.5 {
            flex: 0 0 12.5%;
            max-width: 12.5%;
        }
    }
</style>
