import Vue from 'vue'
import VueMeta from 'vue-meta'
import Buefy from 'buefy'
import PMOAdmin from './PMOAdmin.vue'
import VueMobileDetection from 'vue-mobile-detection';

import './scss/custom.scss';
import '@mdi/font/css/materialdesignicons.css';

Vue.config.productionTip = false
Vue.use(VueMeta);
Vue.use(Buefy);
Vue.use(VueMobileDetection);

Vue.prototype.$pmoInfo = {
  version: "1.1.2"
};

new Vue({
  render: h => h(PMOAdmin),
}).$mount('#pmo-admin');
