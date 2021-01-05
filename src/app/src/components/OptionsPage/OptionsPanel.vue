<template>
    <card-tile :title="'Allgemein'" class="flex flex-column">
        <div class="flex-1 flex flex-column justify-between">
            <div>
                <div class="flex justify-between items-center mb-3">
                    <label>
                        Tote Episoden überspringen:
                        <info-tooltip :text="deadEpisodeTooltipText"/>
                    </label>
                    <toggle-button :labels="false"
                                   :style="toggleButtonColor"
                                   v-model="options.scipIfNoVideo"/>
                </div>
                <div class="flex justify-between items-center">
                <span>
                    Episodenanzahl:
                    <info-tooltip :text="episodeCountTooltipText"/>
                </span>
                    <minus-plus-input v-model="options.episodesToPlay"></minus-plus-input>
                </div>
            </div>
            <div>
                <b-button variant="primary" class="float-right" @click="save">Speichern</b-button>
            </div>
        </div>
        <toast :context="context.SUCCESS"
               :selector="successToastSelector"
               title="Einstellungen Gespeichert">
            Die allgemeinen Einstellungen wurden erfolgreich gespeichert
        </toast>
    </card-tile>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Inject } from 'vue-property-decorator';
    import { Options } from '../../../../store/models/options.model';
    import { StoreService } from '../../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../../shared/constants/SHARED_TYPES';
    import { getOptions } from '../../../../store/selectors/options.selector';
    import { DEFAULT_COLOR } from '../../../../constants/style-variables';
    import InfoTooltip from '../Shared/InfoTooltip.vue';
    import { updateOptionsAction } from '../../../../store/reducers/options.reducer';
    import MinusPlusInput from '../Shared/MinusPlusInput.vue';
    import CardTile from '../Shared/CardTile.vue';
    import { DEAD_EPISODES_TOOLTIP, EPISODE_COUNT_TOOLTIP } from '../../constants/tooltip-texts';
    import { Context } from '../../enums/context.enum';
    import Toast from '../Shared/Toast.vue';

    @Component({
        name: 'options-panel',
        components: {
            CardTile,
            MinusPlusInput,
            InfoTooltip,
            Toast,
        },
    })
    export default class OptionsPanel extends Vue {
        private readonly context = Context;
        private readonly toggleButtonColor = DEFAULT_COLOR;
        private readonly deadEpisodeTooltipText = DEAD_EPISODES_TOOLTIP;
        private readonly episodeCountTooltipText = EPISODE_COUNT_TOOLTIP;
        private readonly successToastSelector = 'success-settings-toast';

        private options: Options;

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        public created(): void {
            this.options = {
                ...this.store.selectSync(getOptions),
            };
        }

        private save(): void {
            this.store.dispatch(updateOptionsAction(this.options));
            this.$bvToast.show(this.successToastSelector);
        }
    }
</script>
