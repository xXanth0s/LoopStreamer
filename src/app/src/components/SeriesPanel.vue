<template>
    <div class="col-sm-4">
        <div class="card">
            <transition name="fade" mode="out-in">
                <div v-if="!hideContent" key="front">
                    <div class="preview-image">
                        <img :src="series.posterHref" @click="changeView()" alt="Avatar">
                    </div>
                    <div class="card-container-bottom">
                        {{series.title}}
                    </div>
                    <div>
                        <b-button block variant="primary" class="mt-2 btn-bottom" @click="changeView"><i
                                class="el-icon-arrow-right"></i></b-button>
                    </div>
                </div>
                <div v-else key="back">
                    <span class="heading" v-bind:title="series.title">
                        {{series.title}}
                    </span>
                    <hr>
                    <div class="px-3">
                        <b-row class="form-group">
                            <b-col cols="3">
                                <label class="card-label">Intro
                                    <el-tooltip placement="bottom" effect="light">
                                        <div slot="content">Sekunden die zu Beginn einer<br>Folge übersprungen wird
                                        </div>
                                    </el-tooltip>
                                </label>

                            </b-col>
                            <b-col cols="8">
                                <el-input-number class="float-right" size="small" v-model="series.scipStartTime"
                                                 :min="0"></el-input-number>
                            </b-col>
                        </b-row>


                        <b-row class="form-group">
                            <b-col cols="3">
                                <label class="card-label">Outro
                                    <el-tooltip placement="bottom" effect="light">
                                        <div slot="content">Sekunden die zu Ende einer<br>Folge übersprungen wird</div>
                                    </el-tooltip>
                                </label>
                            </b-col>
                            <b-col cols="8">
                                <el-input-number class="float-right" size="small" v-model="series.scipEndTime"
                                                 :min="0"></el-input-number>
                            </b-col>
                        </b-row>


                        <b-row>
                            <b-col>
                                <b-button block variant="primary" @click="save">Speichern</b-button>
                            </b-col>
                        </b-row>
                        <b-row v-if="showContinueBtn" class="pt-3">
                            <b-col>
                                <b-button block variant="primary" @click="continueSeries">
                                    {{CurrentEpisode}}
                                    Fortsetzen
                                </b-button>
                            </b-col>
                        </b-row>

                        <b-row class="pt-3">
                            <b-col>
                                <b-button block variant="primary" @click="openDeleteModal">Löschen
                                </b-button>
                            </b-col>
                        </b-row>
                    </div>
                    <b-button block variant="primary" class="mt-2 btn-bottom" @click="changeView"><i
                            class="el-icon-arrow-left"></i></b-button>
                </div>
            </transition>
        </div>
    </div>
</template>

<script lang="ts">
    import { MessageBox } from 'element-ui';
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Emit, Prop } from 'vue-property-decorator';
    import Series from '../../../store/models/series.model';
    import { createContinueSeriesMessage } from '../../../browserMessages/messages/background.messages';
    import { MessageService } from '../../../shared/services/message.service';
    import { optionsContainer } from '../container/container';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';

    @Component({
        name: 'series-panel',
    })
    export default class SeriesPanel extends Vue {

        @Prop(Object)
        private series: Series;

        @Prop()
        private index: number;

        private messageService: MessageService;

        private hideContent = false;

        get showContinueBtn() {
            // return Boolean(this.series?.lastEpisodeWatched?.portalHref?.length)
            //     && (this.series?.lastEpisodeWatched?.hasNextEpisode
            //         || this.series?.lastEpisodeWatched?.timestamp >= 0);
            return true;
        }

        get CurrentEpisode() {
            if (this.series.lastEpisodeWatched) {
                // if (this.series.lastEpisodeWatched.timestamp === -1) {
                //     return `S${this.series.lastEpisodeWatched.season} E${this.series.lastEpisodeWatched.episode + 1}`;
                // }
                // return `S${this.series.lastEpisodeWatched.season} E${this.series.lastEpisodeWatched.episode}`;
            }
            return '';
        }

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

        @Emit('remove')
        remove(): Series {
            return this.series;
        }

        continueSeries() {
            this.messageService.sendMessageToBackground(createContinueSeriesMessage(this.series.key));
        }

        @Emit('save')
        save(): Series {
            return this.series;
        }

        @Emit('reset')
        reset(): Series {
            return this.series;
        }

        public mounted(): void {
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }
    }
</script>

<style lang="scss" scoped>

    .card {
        &:hover {
            box-shadow: 0 8px 8px 1px rgba(0, 0, 0, 0.4);
        }

        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
        transition: 0.3s;
        width: 100%;
        height: 395px;
        position: relative;
        margin-bottom: 25px;

        .preview-image {
            height: 100%;
        }

        h4 {
            text-align: center;
        }

        img {
            /*box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);*/
            position: relative;
            height: 100%;
            width: 100%;
            border-radius: 5px 5px 0 0;
            cursor: pointer;
        }


        .heading {
            min-height: 48px;
            width: 100%;
            text-align: center;
            border-bottom: 2px;
            transform: translateY(25%);
            font-size: 18px;


            h4 {
                min-height: 38px;
            }
        }

        .card-container {
            position: absolute;
            padding: 2px 16px;
            background-color: #ffffff;
            width: 100%;

        }

        .card-container-bottom {
            position: absolute;
            bottom: 33px;
            padding: 2px 16px;
            background-color: #ffffff;
            width: 100%;
            font-size: 24px;
            padding-bottom: 8px;
            text-align: center;

        }

        .btn-bottom {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 40px;
            border-radius: 0;
        }
    }


    .card-label {
        margin-top: 5px;
        margin-left: 5px;
        font-weight: normal;
    }

</style>
