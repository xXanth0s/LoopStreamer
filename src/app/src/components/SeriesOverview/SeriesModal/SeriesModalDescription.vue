<template>
    <div class="px-4 text-left flex">
        <div v-if="description" class="w-3/5">
            {{description}}
        </div>
        <div :class="{'w-2/5': Boolean(description), 'pl-3': Boolean(description)}">
            <div v-if="genres.length">
                Genres: <span v-for="genre in genres" :key="genre.key">{{genre.translations[language]}}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Component from 'vue-class-component';
    import Vue from 'vue';
    import { Inject, Prop, Watch } from 'vue-property-decorator';
    import Series from '../../../../../store/models/series.model';
    import { LANGUAGE } from '../../../../../store/enums/language.enum';
    import { SHARED_TYPES } from '../../../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../../../shared/services/store.service';
    import { Genre } from '../../../../../store/models/genre.model';
    import { getMultipleGenres } from '../../../../../store/selectors/genre.selector';

    @Component({
        name: 'series-modal-description',
    })
    export default class SeriesModalDescription extends Vue {

        @Prop({
            required: true,
            type: Object,
        })
        private series: Series;

        @Prop({
            required: true,
            type: String,
        })

        private language: LANGUAGE;
        private genres: Genre[] = [];


        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        private get description(): string {
            return this.series.descriptions[this.language];
        }

        @Watch('series', { immediate: true })
        private seriesChanged(series: Series): void {
            this.genres = this.store.selectSync(getMultipleGenres, series.genres);
        }
    }
</script>

<style lang="scss" scoped>

</style>
