<template>
    <div>

        <!--            <swiper class="swiper" :options="swiperOption" v-if="seriesArray.length > 0">-->

        <!--                <swiper-slide>Slide 1-->
        <series-panel-front class="col-4 mb-4"
                            v-for="series in seriesData"
                            :key="series.id"
                            :image-url-ending="series.poster_path"
                            :series-name="series.name"
                            :show-settings-icon="false"/>
        <!--                </swiper-slide>-->
        <!--                <div class="swiper-pagination" slot="pagination"></div>-->
        <!--            </swiper>-->

        {{seriesData.length}}
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import MovieDB from 'node-themoviedb';
    import { optionsContainer } from '../container/container';
    import { StoreService } from '../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
    import { MessageService } from '../../../shared/services/message.service';
    import { MovieDBService } from '../../../shared/services/movie-db.service';
    import SeriesPanelFront from '../components/MySeries/SeriesPanelFront.vue';

    @Component({
        name: 'test-page',
        components: {
            SeriesPanelFront,
        },
    })
    export default class HomePage extends Vue {
        private store: StoreService;
        private messageService: MessageService;
        private dataReady = false;
        private movieDBService: MovieDBService;
        private seriesArray: MovieDB.Objects.TVShow[] = null;

        get seriesData(): MovieDB.Objects.TVShow[] {
            return this.seriesArray || [];
        }

        private swiperOption = {
            slidesPerView: 3,
            spaceBetween: 30,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        };

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
            this.movieDBService = optionsContainer.get<MovieDBService>(SHARED_TYPES.MovieDBService);
        }

        public async mounted(): Promise<void> {
            const result = await this.movieDBService.getPopularSeries();

            console.log(result);
            this.seriesArray = result.results;
            this.dataReady = true;
            console.log(this.seriesArray.length);
        }
    }
</script>
