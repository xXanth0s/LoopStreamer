<template>
    <div>
        <div class="content-block">
            <h2>Einstellungen</h2>
        </div>
        <br>
        <br>
        <b-row>
            <options-panel class="col mx-3"/>
            <providors-panel class="col mx-3"/>
        </b-row>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import ProvidorsPanel from '../components/OptionsPage/ProvidorsPanel.vue';
    import OptionsPanel from '../components/OptionsPage/OptionsPanel.vue';

    @Component({
        components: {
            ProvidorsPanel,
            OptionsPanel,
        },
    })
    export default class SettingsPage extends Vue {

    }
</script>
