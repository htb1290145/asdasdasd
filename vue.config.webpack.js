const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      // 目录别名
      alias: {
        assets: 'src/assets',
        components: 'src/components',
        views: 'src/views',
        network: 'src/network'
      }
    }
  }
})
