<template>
    <card-tile :title="'Hoster'">
        <span>Verwende Drag & Drop um die Hoster zu sortieren</span>

        <p class="title">Verwendete Hoster:</p>

        <div class="prov-row drop-area drop-area-not-used">
            <draggable :list="usedProvidors"
                       :options="dragableConfig"
                       class="dragable">
                <div :key="providor.key"
                     class="drag-item"
                     v-for="providor in usedProvidors">
                    <div class="drop-item text-center">
                        <span class="item-name">{{providor.key}}</span>
                    </div>
                </div>
            </draggable>
        </div>

        <p class="title">Nicht zu verwendende Hoster:</p>

        <div class="prov-row drop-area drop-area-not-used">
            <draggable :list="unusedProvidors"
                       :options="dragableConfig"
                       class="dragable">
                <div :key="providor.key"
                     class="drag-item"
                     v-for="providor in unusedProvidors">
                    <div class="drop-item text-center">
                        <span class="item-name">{{providor.key}}</span>
                    </div>
                </div>
            </draggable>
        </div>
        <div class="row col-row" style="">
            <b-button variant="primary" class="btn-bottom" @click="save">Speichern</b-button>
        </div>

        <b-toast id="error-toast" solid>
            <template #toast-title>
                Fehler
            </template>
            <div class="flex-row">
                <i class="fas fa-times red mr-3"></i>
                <span>Mindestens ein Hoster muss verwendet werden</span>
            </div>
        </b-toast>

        <b-toast id="success-hoster-toast" solid>
            <template #toast-title>
                Hoster Gespeichert
            </template>
            <div class="flex-row">
                <i class="fas fa-check green mr-3"></i>
                <span>Die Hoster wurden erfolgreich gespeichert</span>
            </div>
        </b-toast>
    </card-tile>
</template>

<script lang="ts">
    import Draggable from 'vuedraggable';
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Inject } from 'vue-property-decorator';
    import { Providor } from '../../../../store/models/providor.model';
    import { StoreService } from '../../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { getAllProvidors } from '../../../../store/selectors/providors.selector';
    import { updateProvidorsAction } from '../../../../store/reducers/providors.reducer';
    import CardTile from '../Shared/CardTile.vue';

    @Component({
        name: 'save-providors',
        components: {
            CardTile,
            Draggable,
        },
    })
    export default class ProvidorsPanel extends Vue {
        private readonly dragableConfig = {
            group: {
                name: 'providor',
                pull: true,
                put: true,
            },
            draggable: '.drag-item',
        };

        private usedProvidors: Providor[] = [];
        private unusedProvidors: Providor[] = [];

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        public created(): void {
            const providors = this.store.selectSync(getAllProvidors);

            this.usedProvidors = providors.filter(providor => providor.isUsed);
            this.unusedProvidors = providors.filter(providor => !providor.isUsed);
        }

        save(): void {
            if (!this.usedProvidors.length) {
                this.$bvToast.show('error-toast');
            } else {
                this.updateProvidors();
                this.store.dispatch(updateProvidorsAction([ ...this.usedProvidors, ...this.unusedProvidors ]));
                this.$bvToast.show('success-hoster-toast');
            }
        }

        public updateProvidors(): void {
            this.usedProvidors = this.usedProvidors.map((providor, index) => ({
                ...providor,
                index,
                isUsed: true,
            }));

            this.unusedProvidors = this.unusedProvidors.map((providor, index) => ({
                ...providor,
                index,
                isUsed: false,
            }));
        }
    }
</script>

<style lang="scss" scoped>
    @import "src/styles/variables";

    $dropItemSize: 25px;

    .btn-bottom {
        position: absolute;
        bottom: 24px;
        right: 24px;
    }

    .drag-item {
        cursor: move;
    }

    .drop-area {
        border: $border;
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

    .red {
        color: $red;
    }

    .green {
        color: $green;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
</style>
