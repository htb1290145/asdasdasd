// 引入path模块
const path = require('path')
function resolve(dir) {
  // path.join(__dirname)设置绝对路径
  return path.join(__dirname, dir)
}
const { defineConfig } = require('@vue/cli-service')

// 1.链式操作
module.exports = defineConfig({
  chainWebpack: config => {
    // 路径别名
    config.resolve.alias
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
      .set('views', resolve('src/views'))
      .set('network', resolve('src/network'))

    // 发布模式——prod入口文件
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main-prod.js')

      // externals 节点，来配置并加载外部的 CDN 资源。不会打包
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      // 定制内容
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })

    // 开发模式——dev入口文件
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-dev.js')

      // 定制内容
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
})
