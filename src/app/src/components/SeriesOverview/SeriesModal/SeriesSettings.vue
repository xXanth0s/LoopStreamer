<template>
    <div>
        <h5 class="pb-1">Ladefunktionen</h5>
            <b-button @click="reloadSeason" variant="primary">Staffel erneut laden</b-button>
        <h5 class="pt-2 pb-1">Start- und Endzeit konfigurieren</h5>

        <div class="pb-2">
            Für eine Flüssige Wiedergabe, können das <b>Intro und Outro automatisch übersprungen</b> werden.
        </div>
        <div>
            Falls Sie diese Einstellung erneut mittels <b>Popup im Video</b> vornehmen wollen, <b>drücken Sie</b> auf
            den Button <b>"STARTZEIT ZURÜCKSETZEN"</b> oder <b>"ENDZEIT ZURÜCKSETZEN"</b>.
        </div>

        <vue-slider class="mt-5 px-3"
                    v-model="sliderValues"
                    :max="episodeDuration"
                    :dotOptions="sliderOptions"
                    :tooltipFormatter="tooltipFormatter"
                    tooltip="always"/>

        <div class="flex justify-between mt-3">
            <div>
                <b-button @click="resetStartTime"
                          :disabled="!series.isStartTimeConfigured"
                          class="mr-1"
                          variant="outline-primary">
                    STARTZEIT ZURÜCKSETZEN
                </b-button>
                <b-button @click="resetEndTime"
                          :disabled="!series.isEndTimeConfigured"
                          variant="outline-primary">
                    ENDZEIT ZURÜCKSETZEN
                </b-button>
            </div>
            <b-button @click="save" :disabled="!isSaveable" variant="primary">SPEICHERN</b-button>
        </div>
    </div>

</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Inject, Prop, Watch } from 'vue-property-decorator';
    import VueSlider from 'vue-slider-component';
    // eslint-disable-next-line import/extensions,import/no-unresolved
    import { DotOption } from 'vue-slider-component/lib/typings';
    import {
      resetSeriesEndTimeAction,
      resetSeriesStartTimeAction,
      setTimesForSeriesAction,
    } from '../../../../../store/reducers/series.reducer';
    import { Series } from '../../../../../store/models/series.model';
    import { SHARED_TYPES } from '../../../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../../../shared/services/store.service';
    import { getAverageDurationForSeries } from '../../../../../store/selectors/series.selector';
    import {
      forceReloadSeasonInformationAction,
    } from '../../../../../store/actions/shared.actions';
    import { SeriesSeason } from '../../../../../store/models/series-season.model';

    @Component({
        name: 'series-settings',
        components: {
            VueSlider,
        },
    })
    export default class SeriesSettings extends Vue {
        private readonly orangeBackgroundCSS = {
            backgroundColor: 'orange',
            'border-top-color': 'orange',
        };

        private readonly tooltipFormatter = [
            (startTime) => this.mapStartTime(startTime),
            (endTime) => this.mapEndTime(endTime),
        ];

        private startTime = 0;
        private endTime = 0;
        private episodeDuration = 100;

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        @Prop(Object)
        private series: Series;

        @Prop(Object)
        private season: SeriesSeason;

        private get sliderOptions(): [Partial<DotOption>, Partial<DotOption>] {
            const isStartTimeSaveable = !this.series.isStartTimeConfigured
                || this.series.scipStartTime !== this.startTime;

            const isEndTimeSaveable = !this.series.isEndTimeConfigured
                || this.series.scipEndTime !== this.getTimeFromEpisodeEnding(this.endTime);

            const startDot: Partial<DotOption> = {
                tooltipStyle: isStartTimeSaveable ? this.orangeBackgroundCSS : {},
            };

            const endDot: Partial<DotOption> = {
                tooltipStyle: isEndTimeSaveable ? this.orangeBackgroundCSS : {},
            };
            return [startDot, endDot];
        }

        private get isSaveable(): boolean {
            return !this.series.isStartTimeConfigured
                || !this.series.isEndTimeConfigured
                || this.startTime !== this.series.scipStartTime
                || this.getTimeFromEpisodeEnding(this.endTime) !== this.series.scipEndTime;
        }

        private get sliderValues(): [ number, number ] {
            return [ this.startTime, this.endTime ];
        }

        private set sliderValues([ startTime, endTime ]: [ number, number ]) {
            this.startTime = startTime;
            this.endTime = endTime;
        }

        @Watch('series', { immediate: true })
        private seriesChanged(): void {
            this.episodeDuration = this.store.selectSync(getAverageDurationForSeries, this.series.key);
            this.startTime = this.series.isStartTimeConfigured ? this.series.scipStartTime : 0;
            const endTimeSubtraction = this.series.isEndTimeConfigured ? this.series.scipEndTime : 0;

            this.endTime = this.getTimeFromEpisodeEnding(endTimeSubtraction);
        }

        private resetEndTime(): void {
            this.store.dispatch(resetSeriesEndTimeAction({ seriesKey: this.series.key }));
        }

        private reloadSeason(): void {
            this.store.dispatch(forceReloadSeasonInformationAction({ seasonKey: this.season.key }));
        }

        private resetStartTime(): void {
            this.store.dispatch(resetSeriesStartTimeAction({ seriesKey: this.series.key }));
        }

        private save(): void {
            const scipEndTime = this.getTimeFromEpisodeEnding(this.endTime);

            this.store.dispatch(
                setTimesForSeriesAction({ key: this.series.key, scipStartTime: this.startTime, scipEndTime }),
            );
        }

        private mapStartTime(time: number): string {
            return `${time}`;
        }

        private mapEndTime(time: number): string {
            const endTime = this.getTimeFromEpisodeEnding(time);
            return `− ${endTime}`;
        }

        private getTimeFromEpisodeEnding(time: number) {
            return this.episodeDuration - time;
        }
    }
</script>
