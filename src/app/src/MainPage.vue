<template>
    <div>
        <div class="header">
            <b-nav tabs align="center">
                <b-nav-item exact exact-active-class="active" :to="routesConst.HOME_PAGE">Home</b-nav-item>
                <b-nav-item exact exact-active-class="active" :to="routesConst.SERIES_PAGE">Meine Serien</b-nav-item>
                <b-nav-item exact exact-active-class="active" :to="routesConst.SETTINGS_PAGE">Einstellungen</b-nav-item>
                <b-nav-item exact exact-active-class="active" :to="routesConst.FAQ_PAGE">FAQ</b-nav-item>
            </b-nav>
        </div>
        <div class="container">
            <div class="tab-content">
                <div class="tab-pane active">
                    <router-view/>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { globalRoutes } from '../constants/globalRoutes';

    @Component({})
    export default class MainPage extends Vue {
        private routesConst = globalRoutes;
    }

</script>


<style lang="scss" scoped>
    @import '../../../styles/variables';

    .header {
        top: 0;
        z-index: 20;
        width: 100%;
        position: fixed;
        background-color: $black-color;

        display: flex;
        justify-content: center;
    }

    .container {
        margin-top: 70px;
        width: $containerWidth;
        background-color: $containerBackground;
        min-height: 760px;
        padding: 20px;
    }
</style>
