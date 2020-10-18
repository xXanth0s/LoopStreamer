<template>
    <div v-if="series">
        <div class="card">
            <div class="flex-column" key="front" v-if="!hideContent">
                <div>
                    <img :src="series.posterHref" @click="changeView()" alt="Avatar">
                </div>
                <div class="default-title-text title flex-center flex-grow">
                    <span class="text">{{series.title}}</span>
                </div>
                <b-button @click="changeView" block class="btn-bottom" variant="primary"><i
                        class="el-icon-arrow-right"></i></b-button>
            </div>
            <div class="flex-column" key="back" v-else>
                <div class="default-title-text flex-center title underline" v-bind:title="series.title">
                    <span class="active text px-1">{{series.title}}</span>
                </div>
                <div class="px-3 flex-column input-container">
                    <div class="flex-row mt-3">
                        <div class="flex-grow">
                            <label class="card-label">Intro
                                <i class="far fa-question-circle"
                                   title="Sekunden die zu Beginn einer Folge übersprungen werden"
                                   v-b-tooltip.hover/>
                            </label>
                        </div>
                        <div>
                            <el-input-number :min="0" size="small"
                                             v-model="scipS"></el-input-number>
                        </div>
                    </div>
                    <div class="flex-row mt-3">
                        <div class="flex-grow">
                            <label class="card-label">
                                Outro
                                <i class="far fa-question-circle"
                                   title="Sekunden die zu Ende einer Folge übersprungen werden"
                                   v-b-tooltip.hover/>
                            </label>
                        </div>
                        <el-input-number :min="0" size="small"
                                         v-model="scipE"></el-input-number>
                    </div>
                    <div class="flex-grow"></div>
                    <b-button @click="continueSeries" block class="mb-2" v-if="hasNextEpisode" variant="primary">
                        Fortsetzen
                    </b-button>

                    <b-button @click="openDeleteModal" block class="mb-3" variant="primary">Löschen
                    </b-button>

                </div>
                <b-button @click="changeView" block variant="primary"><i
                        class="el-icon-arrow-left"></i></b-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { MessageBox } from 'element-ui';
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop, Watch } from 'vue-property-decorator';
    import { Subject } from 'rxjs';
    import { takeUntil } from 'rxjs/operators';
    import Series from '../../../store/models/series.model';
    import { createContinueSeriesMessage } from '../../../browserMessages/messages/background.messages';
    import { MessageService } from '../../../shared/services/message.service';
    import { optionsContainer } from '../container/container';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../shared/services/store.service';
    import { getSeriesByKey, isSeriesContinuable } from '../../../store/selectors/series.selector';
    import { setEndTimeForSeriesAction, setStartTimeForSeriesAction } from '../../../store/reducers/series.reducer';

    @Component({
        name: 'series-panel',
    })
    export default class SeriesPanel extends Vue {
        private readonly takeUntil$ = new Subject();

        @Prop(String)
        private seriesKey: Series['key'];

        private series: Series = null;

        private messageService: MessageService;
        private store: StoreService;

        private scipS = 0;
        private scipE = 0;
        private hasNextEpisode = false;
        private hideContent = false;

        public openDeleteModal(): void {
            MessageBox.confirm(
                `Möchten Sie ${this.series.title} wirklich löschen?`,
                'Löschen', {
                    confirmButtonText: 'Bestätigen',
                    cancelButtonText: 'Abbrechen',
                    type: 'warning',
                }).then(() => {
                this.remove();
            });
        }

        changeView() {
            this.hideContent = !this.hideContent;
        }

        remove(): Series {
            return this.series;
        }

        continueSeries() {
            this.messageService.sendMessageToBackground(createContinueSeriesMessage(this.series.key));
        }

        public beforeCreate(): void {
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        public mounted(): void {
            this.loadSeriesFromStore();
        }

        @Watch('seriesKey')
        private seriesChanged(seriesKey: string): void {
            this.takeUntil$.next();
            this.loadSeriesFromStore();
        }

        @Watch('scipS')
        private scipStartTimeChanged(currentValue: number, previousValue: number): void {
            if (currentValue !== previousValue) {
                this.store.dispatch(setStartTimeForSeriesAction({ key: this.seriesKey, scipStartTime: currentValue }));
            }
        }

        @Watch('scipE')
        private scipEndTimeChanged(currentValue: number, previousValue: number): void {
            if (currentValue !== previousValue) {
                this.store.dispatch(setEndTimeForSeriesAction({ key: this.seriesKey, scipEndTime: currentValue }));
            }
        }

        private loadSeriesFromStore(): void {
            this.store.selectBehaviour(getSeriesByKey, this.seriesKey).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(series => {
                this.series = series;
                this.scipE = series.scipEndTime || 0;
                this.scipS = series.scipStartTime || 0;
            });

            this.store.selectBehaviour(isSeriesContinuable, this.seriesKey).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isContinuable => this.hasNextEpisode = isContinuable);
        }
    }
</script>

<style lang="scss" scoped>
    @import "src/styles/variables";

    $middleContainerSize: 350px;
    .card {
        height: 100%;

        &:hover {
            box-shadow: 0 8px 8px 1px rgba(0, 0, 0, 0.4);
        }

        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
        transition: 0.3s;
        width: 100%;

        img {
            width: 100%;
            height: $middleContainerSize;
            object-fit: cover;
        }

    }

    .card-label {
        margin-top: 5px;
        margin-left: 5px;
        font-weight: normal;
        white-space: nowrap;
    }

    .flex-column {
        height: 100%;
        flex-direction: column;
        display: flex;
    }

    .flex-row {
        display: flex;
        width: 100%;
    }

    .flex-grow {
        flex: 1;
    }

    .flex-center {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .title {
        min-height: 3em;
        text-align: center;

        .text {
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }
    }

    .underline {
        border-bottom: $border;
    }

    .input-container {
        height: $middleContainerSize;
    }

</style>
