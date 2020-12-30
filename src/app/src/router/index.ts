import Vue from 'vue';
import VueRouter from 'vue-router';
import { globalRoutes } from '../constants/globalRoutes';
import SettingsPage from '../views/SettingsPage.vue';
import TestPage from '../views/TestPage.vue';
import { environment } from '../../../environments/environment';
import SeriesPage from '../views/SeriesPage.vue';

Vue.use(VueRouter);

let routes = [
    {
        path: `/${globalRoutes.SERIES_PAGE}`,
        component: SeriesPage,
    },
    {
        path: `/${globalRoutes.SETTINGS_PAGE}`,
        component: SettingsPage,
    },
    {
        path: `/${globalRoutes.TEST_PAGE}`,
        component: TestPage,
    },
    {
        path: '/',
        redirect: environment.isDev ? `/${globalRoutes.TEST_PAGE}` : `/${globalRoutes.SERIES_PAGE}`,
    },
];

if (!environment.isDev) {
    routes = routes.filter(route => route.component !== TestPage);
}

const router = new VueRouter({
    routes,
});

export default router;
