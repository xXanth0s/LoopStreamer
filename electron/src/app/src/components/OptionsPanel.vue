<template>
    <div>
        <div class="row">
            <h3>Allgemein</h3>
        </div>
        <hr>
        <div class="row col-row">
            <div class="col-sm-9">
                <label>Automatisches Vollbild
                    <el-tooltip placement="bottom" effect="light">
                        <div slot="content">Sobald LoopStreamer gestartet wird,<br/>wechselt der Browser automatisch<br>in
                            den Vollbildmodus
                        </div>
                        <i class="el-icon-info"></i>
                    </el-tooltip>
                </label>
            </div>
            <div class="col-sm-3">
                <el-switch class="float-right"
                           v-model="options.makeFullscreen"
                           active-color="#26aaaf"
                           inactive-color="#d2d1d1">
                </el-switch>
            </div>
        </div>
        <div class="row col-row">
            <div class="col-sm-9 col-label">
                Videos vorbereiten
                <el-tooltip placement="bottom" effect="light">
                    <div slot="content">LoopStreamer bereitet im Hintergrund <br> die nächste Folge vor. Dadurch
                        ist<br/>eine flüssigere Wiedergabe möglich
                    </div>
                    <i class="el-icon-info"></i>
                </el-tooltip>


            </div>
            <div class="col-sm-3">
                <el-switch class="float-right"
                           v-model="options.prepareVideo"
                           active-color="#26aaaf"
                           inactive-color="#d2d1d1">
                </el-switch>

            </div>
        </div>
        <div class="row col-row">
            <div class="col-sm-9 col-label">
                <label>Tote Episoden überspringen
                    <el-tooltip placement="bottom" effect="light">
                        <div slot="content">Falls kein funktionierender Stream<br>existiert, wird automatisch die<br>nächste
                            Folge wiedergegeben
                        </div>
                        <i class="el-icon-info"></i>
                    </el-tooltip>
                </label>
            </div>
            <div class="col-sm-3">
                <el-switch class="float-right"
                           v-model="options.scipIfNoVideo"
                           active-color="#26aaaf"
                           inactive-color="#d2d1d1">
                </el-switch>
            </div>
        </div>
        <div class="row col-row">
            <div class="col-sm-9 col-label">
                <label>Portal Adblock
                    <el-tooltip placement="bottom" effect="light">
                        <div slot="content">Adblocker für die Streamingportale<br>Falls du die Uploader unterstützen<br>willst,
                            dann deaktiviere ihn
                        </div>
                        <i class="el-icon-info"></i>
                    </el-tooltip>
                </label>
            </div>
            <div class="col-sm-3">
                <el-switch class="float-right"
                           v-model="options.portalAdBlock"
                           active-color="#26aaaf"
                           inactive-color="#d2d1d1">
                </el-switch>
            </div>
        </div>
        <div class="row col-row">
            <div class="col-sm-6 col-label">
                <label>Episodenanzahl
                    <el-tooltip placement="bottom" effect="light">
                        <div slot="content">So viele Episoden werden ohne<br>Unterbrechung wiedergegeben</div>
                        <i class="el-icon-info"></i>
                    </el-tooltip>
                </label>
            </div>
            <div class="col-sm-6">
                <el-input-number class="float-right" size="small" v-model="options.episodesToPlay"
                                 :min="0"></el-input-number>
            </div>
        </div>
        <div class="row col-row">
            <div class="col-sm-6 col-label">
                <label>Endcountdown
                    <el-tooltip placement="bottom" effect="light">
                        <div slot="content">So lange wird die Beachrichtigung<br>für die nächste Episode angezeigt</div>
                        <i class="el-icon-info"></i>
                    </el-tooltip>
                </label>
            </div>
            <div class="col-sm-6">
                <el-input-number class="float-right" size="small" v-model.lazy="options.timeTillRequestPopup"
                                 :min="0"></el-input-number>
            </div>
        </div>
        <div class="row col-row">
            <b-button variant="primary" class="btn-bottom" @click="save">Speichern</b-button>
        </div>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Emit, Prop } from 'vue-property-decorator';
    import Options from '../../../store/models/options.model';

    @Component({
        name: 'options-panel',
    })
    export default class OptionsPanel extends Vue {
        @Prop(Object)
        private options?: Options;

        save(): void {
            this.saveEmit();
        }

        @Emit('save')
        public saveEmit(): Options | undefined {
            return this.options;
        }
    }
</script>

<style lang="scss" scoped>


    .btn-bottom {
        position: absolute;
        bottom: 24px;
        right: 24px;
    }
</style>
