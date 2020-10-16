<template>

    <div class="pt-2 px-1 col-4" @click="tileClicked">
        <div class="card"  :class="{'active-item': isSelected}">

            <div class="card-body">
                <div class="title text-center">
                    {{series.title}}
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Component from 'vue-class-component';
    import Vue from 'vue';
    import { Emit, Prop } from 'vue-property-decorator';
    import { Subject } from 'rxjs';
    import { takeUntil } from 'rxjs/operators';
    import { optionsContainer } from '../../container/container';
    import { StoreService } from '../../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { isSeriesExpandedOnOptionsPage } from '../../../../store/selectors/control-state.selector';
    import SeriesDetailView from './SeriesDetailView.vue';
    import Series from '../../../../store/models/series.model';

    @Component({
        name: 'series-tile',
        components: {
            SeriesDetailView,
        },
    })
    export default class SeriesTile extends Vue {
        private readonly takeUntil$ = new Subject();

        @Prop(Object)
        private series: Series;

        private isSelected = false;
        private store: StoreService;

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        @Emit()
        public tileClicked(): Series['key'] {
            return this.series.key;
        }

        public mounted(): void {
            this.store.selectBehaviour(isSeriesExpandedOnOptionsPage, this.series.key).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isSelected => this.isSelected = isSelected);
        }
    }
</script>

<style scoped lang="scss">
    .card {
        cursor: pointer;
        height: 100%;
        background-color: #f8f6f6;
    }

    .card:hover {
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .fat-title {
        font-size: 1.3em;
        font-weight: bold;
    }
</style>
