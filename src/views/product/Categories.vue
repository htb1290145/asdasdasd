<template>
  <div class="categories">
    <!-- 导航区域 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCategoriesBtn">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-row>
        <el-col>
          <!-- ele-ui -->
          <!-- <el-table
            :data="productCategoriesList"
            style="width: 100%; margin-bottom: 20px"
            border
            stripe
            row-key="cat_id"
            :tree-props="{ children: 'children' }"
          >
            <el-table-column label="#" type="index"></el-table-column>
            <el-table-column label="分类名称" prop="cat_name"></el-table-column>
            <el-table-column label="是否有效" prop="cat_deleted"> </el-table-column>
            <el-table-column label="排序" prop="cat_level">
              <template slot-scope="scope">
                <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
                <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
                <el-tag v-else type="warning">三级</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="排序操作"></el-table-column>
          </el-table> -->
          <!-- tree-table -->
          <zk-table
            :data="productCategoriesList"
            :columns="columns"
            :selection-type="false"
            :expand-type="false"
            show-index
            index-text="#"
            border
          >
            <!-- 是否有效 -->
            <template slot="availability" slot-scope="scope">
              <i
                class="el-icon-success"
                v-if="scope.row.cat_deleted === false"
                style="color: lightgreen"
              ></i>
              <i class="el-icon-error" v-else style="color: green"></i>
            </template>
            <!-- 排序 -->
            <template slot="sort" slot-scope="scope">
              <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
              <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
              <el-tag type="warning" v-else>三级</el-tag>
            </template>
            <!-- 操作 -->
            <template slot="operate" slot-scope="">
              <el-button type="primary" icon="el-icon-edit">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete">删除</el-button>
            </template>
          </zk-table>
        </el-col>
      </el-row>

      <!-- 分页 -->
      <el-row>
        <el-col>
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 20, 40]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          >
          </el-pagination>
        </el-col>
      </el-row>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCategoriesDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <!-- 添加分类的表单 -->
      <el-form
        ref="addCateFormRef"
        :model="addCategoriesForm"
        class="demo-form-inline"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCategoriesForm.cat_name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 options标签名 props配置-->
          <el-cascader
            ref="cascaderRef"
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoriesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategories">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ProductCategories',
  data() {
    return {
      // 查询数据参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类列表
      productCategoriesList: [],
      // 总数据条数
      total: 0,
      // tree-table 列配置
      columns: [
        {
          label: '商品分类',
          prop: 'cat_name',
          width: '300px'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          minWidth: '50px',
          // 自定义模板列
          type: 'template',
          template: 'availability'
        },
        {
          label: '排序',
          prop: 'cat_level',
          // 自定义模板列
          type: 'template',
          template: 'sort'
        },
        {
          label: '操作',
          minWidth: '200px',
          // 自定义模板列
          type: 'template',
          template: 'operate'
        }
      ],
      // 添加分类对话框的显示
      addCategoriesDialogVisible: false,
      addCategoriesForm: {
        // 分类名称
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类层级
        cat_level: 0
      },
      // 父级分级分类列表
      parentCateList: [],
      // 添加分类验证规则
      rules: {
        cat_name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }]
      },
      // 级联选择器的配置对象
      cascaderProps: {
        // 选择的值
        value: 'cat_id',
        // 标签名
        label: 'cat_name',
        // 子级名
        children: 'children',
        expandTrigger: 'hover',
        // 解除父子关联，任意一级都可以选中
        checkStrictly: true
      },
      // 选中的父级分类id
      selectedKeys: []
    }
  },
  created() {
    // 获取商品分类列表
    this.getProductCategories()
  },
  methods: {
    // 获取商品分类列表
    async getProductCategories() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.console.error('获取用户信息失败！')
      }
      this.productCategoriesList = res.data.result
      this.total = res.data.total
    },
    // 分页改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getProductCategories()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getProductCategories()
    },
    // 添加分类按钮
    addCategoriesBtn() {
      this.getParentCateList()
      this.addCategoriesDialogVisible = true
    },
    // 获取父级分类
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.console.error('获取用户信息失败！')
      }
      this.parentCateList = res.data
    },
    // 级联选择器选中节点
    parentChange() {
      // 选中的节点id this.selectedKeys
      if (this.selectedKeys.length > 0) {
        // 如果选中了分类，选择最后一项作为父类id
        this.addCategoriesForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类的等级
        this.addCategoriesForm.cat_level = this.selectedKeys.length
        return true
      } else {
        // 如果没有选择，重置为0
        this.addCategoriesForm.cat_pid = 0
        this.addCategoriesForm.cat_level = 0
      }
    },
    // 确定添加分类 + 表单预验证
    addCategories() {
      this.$refs.addCateFormRef.validate(async validate => {
        if (!validate) return false
        const { data: res } = await this.$http.post('categories', this.addCategoriesForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message({
          message: '创建分类成功',
          type: 'success'
        })
      })
      this.getProductCategories()
      this.addCategoriesDialogVisible = false
    },
    // 对话框关闭，重置表单
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCategoriesForm.cat_pid = 0
      this.addCategoriesForm.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.el-table {
  margin-top: 20px;
}
.zk-table {
  margin-top: 20px;
}
</style>
