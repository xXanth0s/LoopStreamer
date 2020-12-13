<template>
    <div class="row">
        <h4>{{seriesCollection.title}}</h4>
        <swiper class="swiper" :options="swiperOption" ref="mySwiperRef">
            <swiper-slide class="h-full"
                          v-for="singleSeries in series"
                          :key="singleSeries.id">
                <series-panel-front class="mb-4 cursor-pointer"
                                    :imageUrl="singleSeries.posterHref"
                                    :series-name="singleSeries.titles[language]"
                                    :show-settings-icon="false"
                                    @click.native="seriesSelected(singleSeries.key)"/>
            </swiper-slide>

            <div class="swiper-pagination" slot="pagination"></div>
            <div class="swiper-button swiper-button-prev top-0 h-full left-0 w-5"
                 slot="button-prev"/>
            <div class="swiper-button swiper-button-next top-0 h-full right-0 w-7" slot="button-next"></div>
        </swiper>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Inject, Prop, Watch } from 'vue-property-decorator';
    import { takeUntil } from 'rxjs/operators';
    import { Swiper, SwiperSlide } from 'vue-awesome-swiper';
    import { Subject } from 'rxjs';
    import { SwiperOptions } from 'swiper';
    import { NamedCollection } from '../../../../store/models/collection.model';
    import Series from '../../../../store/models/series.model';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../../shared/services/store.service';
    import { MessageService } from '../../../../shared/services/message.service';
    import { getMultipleSeriesByKey } from '../../../../store/selectors/series.selector';
    import SeriesPanelFront from '../MySeries/SeriesPanelFront.vue';
    import { LANGUAGE } from '../../../../store/enums/language.enum';
    import { toggleSelectedSeriesForAppAction } from '../../../../store/reducers/app-control-state.reducer';

    @Component({
        name: 'series-carousel',
        components: {
            SeriesPanelFront,
            Swiper,
            SwiperSlide,
        },
    })
    export default class SeriesCarousel extends Vue {

        private readonly takeUntil$ = new Subject();

        private readonly swiperOption: SwiperOptions = {
            slidesPerView: 7,
            spaceBetween: 8,
            breakpoints: {
                320: {
                    slidesPerView: 2,
                    slidesPerGroup: 2,
                },
                480: {
                    slidesPerView: 3,
                    slidesPerGroup: 3,
                },
                640: {
                    slidesPerView: 4,
                    slidesPerGroup: 4,
                },
                800: {
                    slidesPerView: 5,
                    slidesPerGroup: 5,
                },
                960: {
                    slidesPerView: 6,
                    slidesPerGroup: 6,
                },
                1120: {
                    slidesPerView: 6,
                    slidesPerGroup: 6,
                },
                1280: {
                    slidesPerView: 7,
                    slidesPerGroup: 7,
                },
                1440: {
                    slidesPerView: 8,
                    slidesPerGroup: 8,
                },
                1600: {
                    slidesPerView: 9,
                    slidesPerGroup: 9,
                },
                1760: {
                    slidesPerView: 10,
                    slidesPerGroup: 10,
                },
            },
            // pagination: {
            //     el: '.swiper-pagination',
            //     type: 'progressbar',
            // },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            loop: true,
        };

        private series: Series[];

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        @Inject(SHARED_TYPES.MessageService)
        private messageService: MessageService;

        @Prop(Object)
        public seriesCollection: NamedCollection<Series>;

        @Prop(String)
        public language: LANGUAGE;

        @Watch('seriesCollection', { immediate: true })
        private selectionChanged(seriesCollection: NamedCollection<Series>): void {
            this.takeUntil$.next();
            this.store.selectBehaviour(getMultipleSeriesByKey, seriesCollection.data).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(series => this.series = series);
        }

        private seriesSelected(seriesKey: Series['key']): void {
            this.store.dispatch(toggleSelectedSeriesForAppAction(seriesKey));
        }
    }
</script>

<style lang="scss" scoped>
    @import "src/styles/variables";

    .swiper-button {
        background-color: rgba($black-color, .2);
        color: $primary-color;

        &:hover {
            background-color: rgba($black-color, .5);
        }

        &:after {
            font-size: 1rem;
            font-weight: bold;
        }

    }

</style>