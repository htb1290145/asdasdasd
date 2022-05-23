import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
// 双击同一路由报错
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
// 组件
const Login = () => import(/* webpackChunkName: "login" */ '@/views/Login.vue')
const Home = () => import(/* webpackChunkName: "Home" */ '@/views/Home.vue')

const Welcome = () => import(/* webpackChunkName: "Home_Welcome" */ '@/views/Welcome.vue')
const Users = () => import(/* webpackChunkName: "Home_" */ '@/views/users/Users.vue')
const Rights = () => import(/* webpackChunkName: "Home_" */ '@/views/authority/Rights.vue')
const Roles = () => import(/* webpackChunkName: "Home_" */ '@/views/authority/Roles.vue')
const GoodsList = () => import(/* webpackChunkName: "Home_" */ '@/views/product/GoodsList.vue')
const Params = () => import(/* webpackChunkName: "Home_" */ '@/views/product/Params.vue')
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'AppLogin',
    component: Login
  },
  {
    path: '/home',
    name: 'AppHome',
    component: Home,
    // 进入/home 就跳转到 /welcome
    redirect: '/welcome',
    children: [
      // welcome
      {
        path: '/welcome',
        name: 'HomeWelcome',
        component: Welcome
      },
      // 用户管理
      {
        path: '/users',
        component: Users
      },
      // 权限管理
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      // 商品管理
      {
        path: '/goods',
        component: GoodsList
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/categories',
        component: () => import(/* webpackChunkName: "about" */ '@/views/product/Categories.vue')
      },
      {
        path: '/goods/addGood',
        component: () => import(/* webpackChunkName: "about" */ '@/views/product/AddGoods.vue')
      },
      // 订单管理
      {
        path: '/orders',
        component: () => import(/* webpackChunkName: "about" */ '@/views/orders/Orders.vue')
      },
      // 数据统计
      {
        path: '/reports',
        component: () => import(/* webpackChunkName: "about" */ '@/views/reports/Reports.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径  from  从哪个路径开始  next('/login') 一个函数，表示放行，强制跳转至login
  // 通过登录页面，放行
  if (to.path === '/login') return next()
  const token = window.sessionStorage.getItem('token')
  // 如果没有token，则强制跳转会登录界面
  if (!token) return next('/login')
  next()
})

export default router
