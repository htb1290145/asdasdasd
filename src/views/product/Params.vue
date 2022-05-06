<template>
  <div class="params">
    <!-- 导航区域 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 注意区域 -->
      <el-alert
        type="warning"
        title="注意：只允许为第三级分类设置相关的参数！"
        :closable="false"
        show-icon
      >
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="select-productCate">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器 options标签名 props配置 只允许选中三级分类-->
          <el-cascader
            ref="cascaderRef"
            v-model="selectedKeys"
            :options="cateList"
            :props="cascaderProps"
            @change="cascaderChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs标签页 -->
      <el-tabs v-model="activeName" @tab-click="tabClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled">添加参数</el-button>
          <!-- 添加参数表格 -->
          <el-table :data="manyParamsList" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand" style="height: 50px">
              <template slot-scope="scope">
                <!-- 属性标签 -->
                <el-tag
                  :key="item.index"
                  v-for="item in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                >
                  {{ item }}
                </el-tag>
                <!-- 添加标签 只保存当前行的inputValue(给每一行的数据设置inputValue)-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作" width="300px">
              <template slot-scope="">
                <el-button type="primary" icon="el-icon-edit" size="mini">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button type="primary" :disabled="isBtnDisabled">添加属性</el-button>
          <!-- 添加属性表格 -->
          <el-table :data="onlyParamsList" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand" style="height: 50px">
              <template slot-scope="scope">
                <!-- 属性标签 -->
                <el-tag
                  :key="item.index"
                  v-for="item in scope.row.attr_vals"
                  closable
                  :disable-transitions="false"
                >
                  {{ item }}
                </el-tag>
                <!-- 添加标签 -->
                <el-input
                  class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm"
                  @blur="handleInputConfirm"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <!-- 操作列 -->
            <el-table-column label="操作" width="300px">
              <template slot-scope="">
                <el-button type="primary" icon="el-icon-edit" size="mini">修改</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ProductParams',
  data() {
    return {
      // 添加参数/属性按钮的禁用
      isBtnDisabled: true,
      // 动态参数
      manyParamsList: [],
      // 静态属性
      onlyParamsList: [],
      // 级联选择器的配置对象
      cascaderProps: {
        // 选择的值
        value: 'cat_id',
        // 标签名——你所看到的值
        label: 'cat_name',
        // 子级名
        children: 'children',
        expandTrigger: 'hover'
      },
      // 商品分类列表
      cateList: [],
      // 级联选择器选中的分类id
      selectedKeys: [],
      // tabs选中的标签页
      activeName: 'many',
      // 添加参数tag
      inputVisible: false,
      inputValue: ''
    }
  },
  created() {
    this.getAllCateList()
  },
  methods: {
    // 获取全部三级分类-级联选择器
    async getAllCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 3 } })
      if (res.meta.status !== 200) {
        return this.$message.console.error('获取用户信息失败！')
      }
      this.cateList = res.data
    },
    // 级联选择器选中节点-发起请求
    cascaderChange() {
      // 如果选中的不是三级，则重置
      if (this.selectedKeys.length !== 3) {
        this.isBtnDisabled = true
        this.selectedKeys = []
        return false
      }
      this.isBtnDisabled = false
      // 获取三级节点的id
      this.selectedKeys = this.selectedKeys[this.selectedKeys.length - 1]
      this.getParams(this.selectedKeys, this.activeName)
    },
    // 标签页切换-发起请求
    tabClick() {
      this.getParams(this.selectedKeys, this.activeName)
    },
    // 根据第三级分类id查询参数
    async getParams(id, sel) {
      const { data: res } = await this.$http.get(`categories/${id}/attributes`, {
        params: { sel: sel }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取失败')
      }
      // 展开行的标签组。
      res.data.forEach(item => {
        // 把attr_vals以空格分割成数组.如果是属性为空，返回空白数
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 添加布尔值控制文本框和表单值
        item.inputVisible = false
        item.inputValue = ''
      })
      // 表格数据-动态参数/静态属性
      if (this.activeName === 'many') {
        this.manyParamsList = res.data
      } else {
        this.onlyParamsList = res.data
      }
    },
    // 动态添加标签——点击输入
    showInput(row) {
      row.inputVisible = true
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // enter或者失去焦点——添加参数或者属性
    handleInputConfirm(row) {
      console.log(row)
      // 如果没有输入，则变回按钮状态
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return false
      }
      // 如果输入正确，则添加参数标签
      row.attr_vals.push(row.inputValue.trim())
      // 重置
      row.inputValue = ''
      row.inputVisible = false
      // 发起请求保存添加的参数
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.select-productCate {
  margin-top: 20px;
}
.el-table {
  margin-top: 20px;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
/deep/ .el-table__expanded-cell {
  height: 60px;
  text-align: center;
}
/deep/ .el-table__cell {
  height: 60px;
}
.el-tag {
  margin: 0 5px;
}
</style>
