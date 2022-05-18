/* eslint-disable no-unused-vars */
import Vue from 'vue'
import App from './App.vue'
import router from './router/router'
import './plugins/element.js'
// quill富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme

// 导入基础css
import '@/assets/css/base.css'
// 字体图标
import '@/assets/css/fonts/iconfont.css'
// tree-table
import ZkTable from 'vue-table-with-tree-grid'

// axios
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 请求拦截器添加token，保证获取数据的权限
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

// 使用quill富文本编辑器插件
Vue.use(VueQuillEditor /* { default global options } */)
// 使用树形表格插件
Vue.use(ZkTable)

// 全局时间过滤器
Vue.filter('dateFormat', function (originValue) {
  const dt = new Date(originValue)

  const y = dt.getFullYear()
  // padStart 不足两位补成两位数
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDay() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
