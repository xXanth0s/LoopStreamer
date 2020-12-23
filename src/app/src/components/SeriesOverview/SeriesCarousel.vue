<template>
    <div v-if="series.length">
        <h4>{{seriesCollection.title}}</h4>
        <swiper class="swiper w-full" :options="swiperOption" ref="mySwiperRef">
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
    import { Emit, Inject, Prop, Watch, } from 'vue-property-decorator';
    import { takeUntil } from 'rxjs/operators';
    import { Swiper, SwiperSlide } from 'vue-awesome-swiper';
    import { Subject } from 'rxjs';
    import { SwiperOptions } from 'swiper';
    import { NamedCollection } from '../../../../store/models/collection.model';
    import Series from '../../../../store/models/series.model';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../../shared/services/store.service';
    import { MessageService } from '../../../../shared/services/message.service';
    import SeriesPanelFront from '../MySeries/SeriesPanelFront.vue';
    import { LANGUAGE } from '../../../../store/enums/language.enum';
    import { getMultipleSeriesMetaInfos } from '../../../../store/selectors/series-meta-info.selector';
    import { SeriesMetaInfo } from '../../../../store/models/series-meta-info.model';

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

        private get swiperOption(): SwiperOptions {
            return {
                slidesPerView: 7,
                spaceBetween: 8,
                allowTouchMove: false,
                breakpoints: {
                    320: {
                        slidesPerView: this.getSlidesCount(2),
                        slidesPerGroup: this.getSlidesCount(2),
                        loop: this.series.length > 2,
                    },
                    480: {
                        slidesPerView: this.getSlidesCount(3),
                        slidesPerGroup: this.getSlidesCount(3),
                        loop: this.series.length > 3,
                    },
                    640: {
                        slidesPerView: this.getSlidesCount(4),
                        slidesPerGroup: this.getSlidesCount(4),
                        loop: this.series.length > 4,
                    },
                    800: {
                        slidesPerView: this.getSlidesCount(5),
                        slidesPerGroup: this.getSlidesCount(5),
                        loop: this.series.length > 5,
                    },
                    960: {
                        slidesPerView: this.getSlidesCount(6),
                        slidesPerGroup: this.getSlidesCount(6),
                        loop: this.series.length > 6,
                    },
                    1120: {
                        slidesPerView: this.getSlidesCount(7),
                        slidesPerGroup: this.getSlidesCount(7),
                        loop: this.series.length > 7,
                    },
                    1280: {
                        slidesPerView: this.getSlidesCount(8),
                        slidesPerGroup: this.getSlidesCount(8),
                        loop: this.series.length > 8,
                    },
                    1440: {
                        slidesPerView: this.getSlidesCount(9),
                        slidesPerGroup: this.getSlidesCount(9),
                        loop: this.series.length > 9,
                    },
                    1600: {
                        slidesPerView: this.getSlidesCount(10),
                        slidesPerGroup: this.getSlidesCount(10),
                        loop: this.series.length > 10,
                    },
                    1760: {
                        slidesPerView: this.getSlidesCount(11),
                        slidesPerGroup: this.getSlidesCount(11),
                        loop: this.series.length > 11,
                    },
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                loop: false,
            };
        }

        private series: SeriesMetaInfo[];

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        @Inject(SHARED_TYPES.MessageService)
        private messageService: MessageService;

        @Prop(Object)
        public seriesCollection: NamedCollection<Series>;

        @Prop(String)
        public language: LANGUAGE;

        @Prop(Number)
        public fixedSlidesCount: number;

        @Watch('seriesCollection', { immediate: true })
        private selectionChanged(seriesCollection: NamedCollection<Series>): void {
            this.takeUntil$.next();
            this.store.selectBehaviour(getMultipleSeriesMetaInfos, seriesCollection.data).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(series => this.series = series);
        }

        @Emit('seriesClicked')
        private seriesSelected(selectedSeriesKey: Series['key']): Series['key'] {
            return selectedSeriesKey;
        }

        private getSlidesCount(fallbackSlideCount: number): number {
            return this.fixedSlidesCount ? this.fixedSlidesCount : fallbackSlideCount;
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

        &.swiper-button-disabled {
            visibility: hidden;
        }

    }

</style>
