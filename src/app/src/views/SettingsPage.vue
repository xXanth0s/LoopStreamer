<template>
    <div>
        <h2 class="text-center mb-4">Einstellungen</h2>
        <div class="flex flex-1 tile-container">
            <options-panel class="flex-1 mx-2"/>
            <providors-panel class="flex-1 mx-2"/>
        </div>
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

<style lang="scss" scoped>
    .tile-container {
        width: 920px;
        margin: 0 auto;
    }
</style>
