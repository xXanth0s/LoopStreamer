<template>

    <div v-if="seasons" class="flex overflow-hidden flex-wrap mb-3 ">
        <div class="px-3 mt-1 flex flex-column bg-white justify-center">
            <span class="text-black font-black">Staffeln:</span>
        </div>
        <series-season-button
                v-for="season in seasons"
                :key="season.key"
                :active-season-key="selectedSeason"
                :season-info="season"
                @click.native="seasonClicked(season.key)"/>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Emit, Inject, Prop } from 'vue-property-decorator';
    import { Subject } from 'rxjs';
    import { takeUntil } from 'rxjs/operators';
    import { SeriesSeason } from '../../../../../store/models/series-season.model';
    import SeriesSeasonButton from '../../SeriesSearchList/SeasonEpisodeButton.vue';
    import { SHARED_TYPES } from '../../../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../../../shared/services/store.service';
    import { MessageService } from '../../../../../shared/services/message.service';
    import { getSelectedSeason } from '../../../../../store/selectors/app-control-state.selector';

    @Component({
        name: 'seasons-list',
        components: {
            SeriesSeasonButton,
        },
    })
    export default class SeasonsList extends Vue {
        private readonly takeUntil$ = new Subject();

        private selectedSeason: SeriesSeason['key'] = '';

        @Prop(Array)
        public seasons: SeriesSeason[];

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        @Inject(SHARED_TYPES.MessageService)
        private messageService: MessageService;

        public mounted(): void {
            this.fetchSelectedSeason();
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        private fetchSelectedSeason(): void {
            this.store.select(getSelectedSeason).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(season => this.selectedSeason = season);
        }

        @Emit('seasonClicked')
        private seasonClicked(seasonKey: SeriesSeason['key']): SeriesSeason['key'] {
            return seasonKey;
        }
    }
</script>
