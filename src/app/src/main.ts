import './container/container';
import '../styles/options.scss';
import Vue from 'vue';
import VueScrollTo from 'vue-scrollto';
import { Collapse, CollapseItem, Menu, MenuItem, } from 'element-ui';
import BootstrapVue from 'bootstrap-vue';
import VueCarousel from 'vue-carousel';
import { ToggleButton } from 'vue-js-toggle-button';
import { Autoplay, Mousewheel, Navigation, Pagination, Swiper as SwiperClass, } from 'swiper/swiper.esm';
import getAwesomeSwiper from 'vue-awesome-swiper/dist/exporter';
import VueYouTubeEmbed from 'vue-youtube-embed';
import MainPage from './MainPage.vue';
import router from './router';

Vue.config.productionTip = false;

Vue.component('ToggleButton', ToggleButton);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(BootstrapVue);
Vue.use(VueCarousel);
Vue.use(VueYouTubeEmbed);
Vue.use(VueScrollTo);

SwiperClass.use([ Pagination, Mousewheel, Navigation, Autoplay ]);
Vue.use(getAwesomeSwiper(SwiperClass));

new Vue({
    router,
    render: h => h(MainPage),
}).$mount('#app');
