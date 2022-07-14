import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Single from "./utils/single.js"

Vue.config.productionTip = false

Vue.prototype.$single = Single.getInstanceof({id:1})
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
