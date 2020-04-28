<template>
    <div>
        <div class="row">
            <h3>Hoster</h3>
        </div>
        <hr>
        <div class="row">
            <span>Verwende Drag & Drop um die Hoster zu sortieren</span>
        </div>
        <div class="row">
            <p class="title">Verwendete Hoster:
                <el-tooltip placement="bottom" effect="light">
                    <div slot="content">In der hier angegebenen Reihenfolge wird<br>ein funktionierender Stream für
                        die<br>geöffnete Serie gesucht
                    </div>
                    <i class="el-icon-info"></i>
                </el-tooltip>
            </p>
        </div>
        <div class="row">
            <div class="col">
                <div class="prov-row drop-area">
                    <draggable class="dragable" id="used-providors" :list="usedProvidors"
                               :="{group:{name:'prov', pull:true, put:true }, draggable: '.drag-item'}"
                               v-on:end="checkMove">
                        <div v-for="element in usedProvidors" v-bind:key="element.key" class="drag-item">
                            <div class="drop-item">
                                <span class="item-name">{{element.key}}</span>
                                <span class="drop-image-box float-right">
                                    <img :src="element.icon">
                                </span>
                            </div>
                        </div>
                    </draggable>
                </div>
            </div>
        </div>
        <div class="row">
            <p class="title">Nicht zu verwendende Hoster:
                <el-tooltip placement="bottom" effect="light">
                    <div slot="content">Diese Hoster werden bei der Suche<br>nach einem passenden Stream ignoriert</div>
                    <i class="el-icon-info"></i>
                </el-tooltip>
            </p>
        </div>

        <div class="row">
            <div class="col">
                <div class="prov-row drop-area drop-area-not-used">
                    <draggable class="dragable" id="not-used-providors" :list="unusedProvidors"
                               :options="{group:{name:'prov', pull:true, put:true }, draggable: '.drag-item'}"
                               v-on:end="checkMove">
                        <div v-for="element in unusedProvidors" v-bind:key="element.key" class="drag-item">
                            <div class="drop-item">
                                <span class="item-name">{{element.key}}</span>
                                <div v-if="element.icon != ''" class="drop-image-box float-right">
                                    <img :src="element.icon">
                                </div>
                            </div>
                        </div>
                    </draggable>
                </div>
            </div>
        </div>
        <div class="row col-row" style="align-self: flex-end;">
            <b-button variant="primary" class="btn-bottom" @click="save">Speichern</b-button>
        </div>
    </div>
</template>

<script lang="ts">
    import Draggable from 'vuedraggable';
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Emit, Prop, Watch } from 'vue-property-decorator';
    import Providor from '../../../store/models/providor.model';

    @Component({
        name: 'save-providors',
        components: {
            Draggable,
        },
    })
    export default class ProvidorsPanel extends Vue {

        private usedProvidors: Providor[] = [];
        private unusedProvidors: Providor[] = [];

        @Prop()
        providors: Providor[] = [];

        @Watch('providors', { immediate: true })
        updateProvidors(newVal: Providor[]): void {
            this.usedProvidors = newVal.filter(providor => providor.isUsed).sort(this.compareProvidorsIndex);
            this.unusedProvidors = newVal.filter(providor => !providor.isUsed).sort(this.compareProvidorsIndex);
        }

        @Emit('save')
        save(): Providor[] {
            return [ ...this.unusedProvidors, ...this.usedProvidors ];
        }

        public checkMove(): void {
            for (let i = 0; i < this.usedProvidors.length; i++) {
                this.usedProvidors[i].index = i;
                this.usedProvidors[i].isUsed = true;
            }
            for (let i = 0; i < this.unusedProvidors.length; i++) {
                this.unusedProvidors[i].index = i + this.usedProvidors.length;
                this.unusedProvidors[i].isUsed = false;
            }
        }

        private compareProvidorsIndex(providorA?: Providor, providorB?: Providor): number {
            if (providorA && providorB) {
                return providorA.index - providorB.index;
            }
            return 0;
        }
    }
</script>

<style lang="scss" scoped>
    @import "../../../../styles/variables";


    .btn-bottom {
        position: absolute;
        bottom: 24px;
        right: 24px;
    }


    .drag-item {
        cursor: move;
    }


    .drop-area {
        border: 1px solid $borderColor;
        border-radius: 1px;
        min-height: $dropItemSize;
    }

    .drop-area-not-used {
        margin-bottom: 10px;
    }

    .drop-item {
        border: 1px solid $borderColor;
        border-radius: 1px;
        height: $dropItemSize;
        padding-left: 5px;

        span {

            font-weight: bold;
        }
    }

    .drop-image-box {
        border: 1px solid $borderColor;
        border-radius: 3px;
        background: $containerBackground;
        height: $dropItemSize;

        img {
            max-height: 100%;
        }
    }

    .dragable {
        min-height: $dropItemSize;
    }
</style>
