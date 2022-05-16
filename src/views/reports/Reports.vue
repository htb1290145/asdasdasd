<template>
  <div class="reports">
    <!-- 导航区域 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 2 准备DOM容器 -->
      <div id="main" style="width: 600px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// 1 引入echarts
import * as echarts from 'echarts'
// lodash库
import _ from 'lodash'

export default {
  name: 'SellReports',
  data() {
    return {
      // 需要合并的对象
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {},
  async mounted() {
    const { data: res } = await this.$http.get('reports/type/1')
    console.log(res)
    // 3 基于DOM，初始化echarts实例
    const myChart = echarts.init(document.getElementById('main'))
    // 准备数据和配置项
    const result = _.merge(res.data, this.options)
    console.log(result)
    // 4 绘制图表 + 5 展示
    myChart.setOption(result)
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
</style>
