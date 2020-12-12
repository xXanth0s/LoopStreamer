<template>
    <div class="header">
        <div class="spacer-left control-buttons-size"></div>
        <b-nav tabs align="center">
            <b-nav-item exact exact-active-class="active" :to="routesConst.HOME_PAGE">Home</b-nav-item>
            <b-nav-item exact exact-active-class="active" :to="routesConst.SERIES_LIST">Alle Serien</b-nav-item>
            <b-nav-item exact exact-active-class="active" :to="routesConst.SERIES_PAGE">Meine Serien</b-nav-item>
            <b-nav-item exact exact-active-class="active" :to="routesConst.SETTINGS_PAGE">Einstellungen</b-nav-item>
            <b-nav-item exact exact-active-class="active" :to="routesConst.FAQ_PAGE">FAQ</b-nav-item>
            <b-nav-item v-if="isDev" exact exact-active-class="active" :to="routesConst.TEST_PAGE">Test</b-nav-item>
        </b-nav>
        <WindowControlButtons class="no-drag spacer-right" :hide-buttons="false"/>
    </div>

</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import WindowControlButtons from '../../../shared/html/components/WindowControlButtons.vue';
    import { globalRoutes } from '../constants/globalRoutes';
    import { environment } from '../../../environments/environment';

    @Component({
        name: 'NavBar',
        components: {
            WindowControlButtons,
        },
    })
    export default class NavBar extends Vue {
        private readonly routesConst = globalRoutes;
        private readonly isDev = environment.isDev;
    }
</script>

<style scoped lang="scss">
    @import "src/styles/variables";

    .spacer-left {
        margin-right: auto;
    }

    .spacer-right {
        margin-left: auto;
    }

    .control-buttons-size {
        width: $windowControlButtonsHeight * 3;
    }

    .no-drag {
        -webkit-app-region: no-drag;
    }

    .header {
        top: 0;
        z-index: 20;
        width: 100%;
        position: fixed;
        background-color: $black-color;
        -webkit-app-region: drag;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    a {
        -webkit-app-region: no-drag;
    }
</style>
