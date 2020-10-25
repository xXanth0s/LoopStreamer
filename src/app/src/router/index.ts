import Vue from 'vue';
import VueRouter from 'vue-router';
import { globalRoutes } from '../../constants/globalRoutes';
import WelcomePage from '../views/WelcomePage.vue';
import SettingsPage from '../views/SettingsPage.vue';
import InfoPage from '../views/InfoPage.vue';
import MySeriesPage from '../views/MySeriesPage.vue';
import TestPage from '../views/TestPage.vue';
import { environment } from '../../../environments/environment';

Vue.use(VueRouter);

let routes = [
    {
        path: `/${globalRoutes.HOME_PAGE}`,
        component: WelcomePage
    },
    {
        path: `/${globalRoutes.SETTINGS_PAGE}`,
        component: SettingsPage
    },
    {
        path: `/${globalRoutes.SERIES_PAGE}`,
        component: MySeriesPage
    },
    {
        path: `/${globalRoutes.FAQ_PAGE}`,
        component: InfoPage
    },
    {
        path: `/${globalRoutes.TEST_PAGE}`,
        component: TestPage
    },
    {
        path: '/',
        redirect: environment.isDev ? `/${globalRoutes.TEST_PAGE}` : `/${globalRoutes.HOME_PAGE}`
    },
];

if (!environment.isDev) {
    routes = routes.filter(route => route.component !== TestPage);
}

const router = new VueRouter({
    routes
});

export default router;
