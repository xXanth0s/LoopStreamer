import './container/container';
import '../styles/options.scss';
import Vue from 'vue';
import router from './router';
import MainPage from './MainPage.vue';
import { Collapse, CollapseItem, Menu, MenuItem } from 'element-ui';
import BootstrapVue from 'bootstrap-vue';
import VueCarousel from 'vue-carousel';
import { ToggleButton } from 'vue-js-toggle-button';
import { Autoplay, Mousewheel, Navigation, Pagination, Swiper as SwiperClass } from 'swiper/swiper.esm';
import getAwesomeSwiper from 'vue-awesome-swiper/dist/exporter';

Vue.config.productionTip = false;

Vue.component('ToggleButton', ToggleButton);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(BootstrapVue);
Vue.use(VueCarousel);

SwiperClass.use([ Pagination, Mousewheel, Navigation, Autoplay ]);
Vue.use(getAwesomeSwiper(SwiperClass));

new Vue({
    router,
    render: h => h(MainPage)
}).$mount('#app');
