import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
import routes from './routes'
import Mock from './mock'
import SMSUtil from './common/js/util'

import './components/sms-exambrief'
import './components/sms-goodnessgrade'
import './components/sms-scoreband'
import './components/sms-scoregrade'
import './components/sms-ordergrade'
import './components/sms-scoretopgrade'
import './components/sms-yeartopgrade'
import './components/sms-othersetting'

import './components/sms-stat-filter1'
import './components/sms-stat-filter2'
import './components/sms-stat-filter3'
import './components/sms-stat-filter4'
import './components/sms-stat-filter5'
import './components/sms-stat-filter6'
import './components/sms-stat-filter7'
import './components/sms-stat-filter8'
import './components/sms-stat-filter9'
import './components/sms-stat-filter10'
import './components/sms-stat-filter11'
import './components/sms-stat-filter12'
import './components/sms-stat-filter13'
import './components/sms-stat-filter14'
import './components/sms-stat-filter15'

import './components/mypagination'
import './components/mybreadcrumb'

import './assets/theme/theme-sms/index.css'
import 'font-awesome/css/font-awesome.min.css'

Mock.bootstrap();

Vue.use(ElementUI, { size: 'small' });
Vue.use(VueRouter)
Vue.use(Vuex)

const router = new VueRouter({
  routes:routes,
  mode:'history'
})

const beforeEach = function(to, from, next) {
  window._this = null;
  
  let user = sms_store('sms-user');
  if (to.path == '/orderstatistics/byperson/print') {
    next();
  } else if (to.path !== '/sso' && window.ParameterMap && window.ParameterMap.accredit_code) {
    sessionStorage.setItem('sms-redirect-url', to.path);
    next({ path: '/sso' });
  } else if (user == null && to.path !== '/sso' && to.path !== '/login') {
    SMSUtil.gotoPath('login');
  } else if (to.path === '/') {
    SMSUtil.gotoPath('home');
  } else {
    next();
  }
}

router.beforeEach((to, from, next) => {
  if (to.path === '/login' || (window.ParameterMap && window.ParameterMap.accredit_code)) {
    sms_remove_store('sms-user');
    sms_remove_store('sms-token');
  }

  if (window._this) {
    window._this.$confirm('未设置的成绩釆用默认100分。', '提示', {
          type: 'info'
      }).then(() => {
        localStorage.setItem(window._examid, '1');
        beforeEach(to, from, next);
      }).catch(() => {
        beforeEach(to, from, next);
      });
  } else {
    beforeEach(to, from, next);
  }
})

window.EventHub = new Vue()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
