<template>
    <card-tile :title="'Allgemein'">
        <div class="flex-row">
            <label>
                Tote Episoden überspringen:
                <info-tooltip :text="deadEpisodeTooltipText"/>
            </label>
            <toggle-button :labels="false"
                           :style="toggleButtonColor"
                           v-model="options.scipIfNoVideo"/>
        </div>
        <div class="flex-row pt-3">
                <span>
                    Episodenanzahl:
                    <info-tooltip :text="episodeCountTooltipText"/>
                </span>
            <minus-plus-input v-model="options.episodesToPlay"></minus-plus-input>
        </div>
        <div class="row col-row">
            <b-button variant="primary" class="btn-bottom" @click="save">Speichern</b-button>
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
    import Options from '../../../store/models/options.model';
    import { optionsContainer } from '../container/container';
    import { StoreService } from '../../../shared/services/store.service';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
    import { MessageService } from '../../../shared/services/message.service';
    import { getOptions } from '../../../store/selectors/options.selector';
    import { DEFAULT_COLOR } from '../../../constants/style-variables';
    import InfoTooltip from './InfoTooltip.vue';
    import { updateOptionsAction } from '../../../store/reducers/options.reducer';
    import MinusPlusInput from './MinusPlusInput.vue';
    import CardTile from './CardTile.vue';
    import { DEAD_EPISODES_TOOLTIP, EPISODE_COUNT_TOOLTIP } from '../constants/tooltip-texts';
    import { Context } from '../enums/context.enum';
    import Toast from './Toast.vue';

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

        private store: StoreService;
        private messageService: MessageService;

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
            this.messageService = optionsContainer.get<MessageService>(SHARED_TYPES.MessageService);
        }

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

<style lang="scss" scoped>
    @import "src/styles/variables";

    .btn-bottom {
        position: absolute;
        bottom: 24px;
        right: 24px;
    }

    .flex-row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .green {
        color: $green;
    }
</style>
