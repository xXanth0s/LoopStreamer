<template>
    <div>
        <div class="content-block">
            <h2>Einstellungen</h2>
        </div>
        <br>
        <br>
        <b-row>
                <options-panel class="card-container panel col mx-3" :options="options" v-on:save="saveOptions"></options-panel>
                <providors-panel class="card-container panel col mx-3" :providors="providors"
                                 v-on:save="saveProvidors"></providors-panel>
        </b-row>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Notification } from 'element-ui';
    import { updateOptionsAction } from '../../../store/reducers/options.reducer';
    import { getOptions } from '../../../store/selectors/options.selector';
    import { updateProvidorsAction } from '../../../store/reducers/providors.reducer';
    import { getAllProvidors } from '../../../store/selectors/providors.selector';
    import messages from '../../constants/messages';
    import Providor from '../../../store/models/providor.model';
    import Options from '../../../store/models/options.model';
    import ProvidorsPanel from '../components/ProvidorsPanel.vue';
    import OptionsPanel from '../components/OptionsPanel.vue';
    import { StoreService } from '../../../shared/services/store.service';
    import { optionsContainer } from '../container/container';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';

    @Component({
        components: {
            ProvidorsPanel,
            OptionsPanel,
        },
    })
    export default class SettingsPage extends Vue {
        private store: StoreService;

        private options: Options = null;
        private providors: Providor[] = [];

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
        }

        public mounted(): void {
            this.options = this.store.selectSync(getOptions);
            this.providors = this.store.selectSync(getAllProvidors);
        }

        public async saveOptions(options: Options) {
            this.store.dispatch(updateOptionsAction(options));
            Notification({
                title: messages.savingTitle,
                message: messages.savingText,
                type: 'success',
                offset: 60,
            });
        }

        public async saveProvidors(providors: Providor[]) {
            // eslint-disable-next-line no-undef
            this.store.dispatch(updateProvidorsAction(providors));
            Notification.success({
                title: messages.savingTitle,
                message: messages.savingText,
                offset: 60,
            });
        }
    }
</script>

<style lang="scss" scoped>
</style>
