import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
// 双击同一路由报错
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'AppLogin',
    component: () => import(/* webpackChunkName: "about" */ '@/views/Login.vue')
  },
  {
    path: '/home',
    name: 'AppHome',
    component: () => import(/* webpackChunkName: "about" */ '@/views/Home.vue'),
    // 进入/home 就跳转到 /welcome
    redirect: '/welcome',
    children: [
      // welcome
      {
        path: '/welcome',
        name: 'HomeWelcome',
        component: () => import(/* webpackChunkName: "about" */ '@/views/Welcome.vue')
      },
      // 用户管理
      {
        path: '/users',
        component: () => import(/* webpackChunkName: "about" */ '@/views/users/Users.vue')
      },
      // 权限管理
      {
        path: '/rights',
        component: () => import(/* webpackChunkName: "about" */ '@/views/authority/Rights.vue')
      },
      {
        path: '/roles',
        component: () => import(/* webpackChunkName: "about" */ '@/views/authority/Roles.vue')
      },
      // 商品管理
      {
        path: '/goods',
        component: () => import(/* webpackChunkName: "about" */ '@/views/product/GoodsList.vue')
      },
      {
        path: '/params',
        component: () => import(/* webpackChunkName: "about" */ '@/views/product/Params.vue')
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
