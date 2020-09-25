import './container/container';
import '../styles/options.scss';
import Vue from 'vue';
import router from './router';
import MainPage from './MainPage.vue';
import {
    Button,
    Col,
    Collapse,
    CollapseItem,
    InputNumber,
    Menu,
    MenuItem,
    Row,
    Switch,
    Tabs,
    Tooltip
} from 'element-ui';
import BootstrapVue from 'bootstrap-vue';
import { initBrowserStore } from '../../store/store/browser-store';

Vue.config.productionTip = false;

initBrowserStore();

Vue.use(Switch);
Vue.use(InputNumber);
Vue.use(Button);
Vue.use(Col);
Vue.use(Row);
Vue.use(Tabs);
Vue.use(Tooltip);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Menu);
Vue.use(MenuItem);
Vue.use(BootstrapVue);

  new Vue({
    router,
    render: h => h(MainPage)
  }).$mount('#app');
