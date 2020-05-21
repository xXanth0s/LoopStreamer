import Vue from 'vue';
import VueRouter from 'vue-router';
import { globalRoutes } from '../../constants/globalRoutes';
import WelcomePage from '../views/WelcomePage.vue';
import SettingsPage from '../views/SettingsPage.vue';
import InfoPage from '../views/InfoPage.vue';
import SeriesPage from '../views/SeriesPage.vue';

Vue.use(VueRouter);

const routes = [
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
    component: SeriesPage
  },
  {
    path: `/${globalRoutes.FAQ_PAGE}`,
    component: InfoPage
  },
  { path: '/', redirect:  `/${globalRoutes.HOME_PAGE}` }
  // {
  //   path: `/${globalRoutes.SERIES_PAGE}`,
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
];

const router = new VueRouter({
  routes
});

export default router
