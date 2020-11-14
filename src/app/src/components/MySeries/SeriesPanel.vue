<template>
    <div v-if="series">
        <div class="card">
            <div class="flex-column" v-if="!showSettings">
                <div>
                    <i @click="toggleSettings" class="fas fa-cog spin-icon absolute top-0 right-0 mt-2 mr-2 icon"></i>
                    <img :src="series.posterHref" alt="Avatar">
                </div>
                <div class="default-title-text title flex-center flex-grow">
                    <span class="text">{{series.title}}</span>
                </div>
            </div>
            <div class="flex-column" v-else>
                <div class="default-title-text flex-row title underline-box px-2" v-bind:title="series.title">
                    <i @click="toggleSettings" class="fas fa-chevron-left icon"></i>
                    <span class="active text px-1">{{series.title}}</span>
                    <i @click="openDeleteModal()" class="fas fa-times icon red-icon"></i>
                </div>
                <div class="px-3 d-flex flex-column input-container">
                    <div class="d-flex flex-row justify-content-between align-items-center mt-3">
                        <div class="d-flex">
                            <div class="d-flex">Intro:
                                <info-tooltip :text="scipStartTimeTooltipText" class="pl-1"/>
                            </div>
                        </div>
                        <div>
                            <minus-plus-input v-model="scipS"/>
                        </div>
                    </div>
                    <div class="d-flex flex-row justify-content-between align-items-center mt-3">
                            <span class="d-flex">
                                Outro:
                                <info-tooltip :text="scipEndTimeTooltipText" class="pl-1"/>
                            </span>
                        <minus-plus-input v-model="scipE"/>
                    </div>

                    <div class="flex-grow"></div>

                    <b-button @click="openResetModal" block class="mb-2" variant="outline-primary">Zeiten zurücksetzen
                    </b-button>

                    <b-button @click="saveSettings" block class="mb-3" variant="primary">Speichern
                    </b-button>
                </div>
            </div>
            <b-button @click="toggleSeries" block class="btn-bottom" variant="primary"><i
                    :class="{'transform-arrow': isActive}" class="el-icon-arrow-right expand-button"></i></b-button>
        </div>

        <toast :context="context.SUCCESS"
               :selector="saveSuccessToastSelector"
               title="Einstellungen Gespeichert">
            Die Zeiten für die Serie {{series.title}} wurden aktualisiert
        </toast>

        <toast :context="context.SUCCESS"
               :selector="resetSuccessToastSelector"
               title="Zeiten zurückgesetzt">
            Die Zeiten für die Serie {{series.title}} wurden erfolgreich zurückgesetzt
        </toast>

        <series-delete-modal
                :title="series.title"
                @approved="remove"
                v-model="showDeleteModal"/>

        <series-reset-modal
                :title="series.title"
                @approved="reset"
                v-model="showResetModal"/>


    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop, Watch } from 'vue-property-decorator';
    import { Subject } from 'rxjs';
    import { filter, takeUntil } from 'rxjs/operators';
    import Series from '../../../../store/models/series.model';
    import { MessageService } from '../../../../shared/services/message.service';
    import { optionsContainer } from '../../container/container';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../../shared/services/store.service';
    import { getSeriesByKey, isSeriesContinuable } from '../../../../store/selectors/series.selector';
    import {
        resetSeriesAction,
        setEndTimeForSeriesAction,
        setStartTimeForSeriesAction
    } from '../../../../store/reducers/series.reducer';
    import InfoTooltip from '../InfoTooltip.vue';
    import { SERIES_PANEL_SCIP_END_TIME, SERIES_PANEL_SCIP_START_TIME } from '../../constants/tooltip-texts';
    import MinusPlusInput from '../MinusPlusInput.vue';
    import { deleteSeriesAction } from '../../../../store/actions/shared.actions';
    import { toggleSelectedSeriesForAppAction } from '../../../../store/reducers/app-control-state.reducer';
    import { isSeriesExpandedOnApp } from '../../../../store/selectors/app-control-state.selector';
    import Toast from '../Toast.vue';
    import { Context } from '../../enums/context.enum';
    import SeriesDeleteModal from './SeriesDeleteModal.vue';
    import SeriesResetModal from './SeriesResetModal.vue';

    @Component({
        name: 'series-panel',
        components: {
            SeriesDeleteModal,
            SeriesResetModal,
            Toast,
            MinusPlusInput,
            InfoTooltip,
        },
    })
    export default class SeriesPanel extends Vue {

        private readonly context = Context;
        private readonly takeUntil$ = new Subject();
        private readonly scipStartTimeTooltipText = SERIES_PANEL_SCIP_START_TIME;
        private readonly scipEndTimeTooltipText = SERIES_PANEL_SCIP_END_TIME;
        private readonly saveSuccessToastSelector = 'save-success-save-toast';
        private readonly resetSuccessToastSelector = 'reset-success-save-toast';

        @Prop(String)
        private seriesKey: Series['key'];

        private series: Series = null;

        private messageService: MessageService;
        private store: StoreService;

        private isActive: boolean;
        private showDeleteModal = false;
        private showResetModal = false;

        private scipS = 0;
        private scipE = 0;
        private hasNextEpisode = false;
        private showSettings = false;

        toggleSettings() {
            this.showSettings = !this.showSettings;
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
            this.loadIsActiveStateFromStore();
        }

        public saveSettings(): void {
            this.store.dispatch(setStartTimeForSeriesAction({ key: this.seriesKey, scipStartTime: this.scipS }));
            this.store.dispatch(setEndTimeForSeriesAction({ key: this.seriesKey, scipEndTime: this.scipE }));

            this.$bvToast.show(this.saveSuccessToastSelector);
        }

        public toggleSeries(): void {
            this.store.dispatch(toggleSelectedSeriesForAppAction(this.seriesKey));
        }

        private openDeleteModal(): void {
            this.showDeleteModal = true;
        }

        private closeDeleteModal(): void {
            this.showDeleteModal = false;
        }

        private remove(): void {
            this.closeDeleteModal();
            this.store.dispatch(deleteSeriesAction(this.seriesKey));
        }

        private openResetModal(): void {
            this.showResetModal = true;
        }

        private closeResetModal(): void {
            this.showResetModal = false;
        }

        private reset(): void {
            this.closeResetModal();
            this.store.dispatch(resetSeriesAction(this.series.key));

            this.$bvToast.show(this.resetSuccessToastSelector);
        }

        @Watch('seriesKey')
        private seriesChanged(): void {
            this.takeUntil$.next();
            this.loadSeriesFromStore();
        }

        private loadSeriesFromStore(): void {
            this.store.selectBehaviour(getSeriesByKey, this.seriesKey).pipe(
                takeUntil(this.takeUntil$),
                filter(Boolean),
            ).subscribe((series: Series) => {
                this.series = series;
                this.scipE = series.scipEndTime || 0;
                this.scipS = series.scipStartTime || 0;
            });

            this.store.selectBehaviour(isSeriesContinuable, this.seriesKey).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isContinuable => this.hasNextEpisode = isContinuable);
        }

        private loadIsActiveStateFromStore(): void {
            this.store.selectBehaviour(isSeriesExpandedOnApp, this.seriesKey).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isActive => {
                this.isActive = isActive;
                this.$forceUpdate();
            });
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

    .underline-box {
        border-bottom: $border;
    }

    .input-container {
        height: $middleContainerSize;
    }

    .transform-arrow {
        transform: rotate(90deg);
    }

    .icon {
        cursor: pointer;
        color: $primary-color;
        font-size: 1.5em;
    }

    .expand-button {
        transition: all 0.2s;
    }

    .red-icon {
        &:hover {
            color: $red;
        }
    }

    .spin-icon {
        transition: transform 1.2s ease-in-out;

        &:hover {
            transform: rotate(180deg);
        }
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

</style>
