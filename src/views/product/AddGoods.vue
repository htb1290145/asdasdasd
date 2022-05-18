<template>
  <div class="add-good">
    <!-- 导航区域 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示 -->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <!-- 步骤条区域 字符串-0=数字-->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- 标签页区域 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :stretch="true"
          @tab-click="tabClick"
          :before-leave="beforeTabLeave"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cascaderProps"
                @change="cascaderChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 商品参数 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in goodManyParams"
              :key="item.attr_id"
            >
              <!-- 多选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="ele"
                  v-for="ele in item.attr_vals"
                  :key="ele"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in goodOnlyParams" :key="item.index">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 上传图片 -->
            <!-- 手动设置请求头 -->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-success="successUpload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :file-list="fileList"
              list-type="picture"
              :headers="headerObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce" />
            <el-button type="primary" class="add-good-btn" @click="addGood">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="dialogVisible"
      width="50%"
      :before-close="dialogClose"
    >
      <img :src="previewPath" alt="" class="picture" />
    </el-dialog>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'AddGoods',
  data() {
    return {
      // 激活的索引
      activeIndex: '0',
      // 表单的值
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        // 商品分类数组
        goods_cat: [],
        // 图片的临时路径
        pics: [],
        // 商品内容
        goods_introduce: '',
        // 动态、静态参数
        attrs: []
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 级联选择器数据
      cateList: [],
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
      // 商品动态参数
      goodManyParams: [],
      // 商品静态参数
      goodOnlyParams: [],
      // 图片上传
      fileList: [],
      // 图片上传的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览对话框
      dialogVisible: false,
      // 预览图片的url
      previewPath: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类-级联选择器
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.console.error('获取商品分类失败！')
      }
      this.cateList = res.data
    },
    // 级联选择器选中三级节点
    cascaderChange() {
      // 如果选中的不是三级id，则清空列表
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 未选择三级分类，阻止标签页切换
    beforeTabLeave(activeName, oldActiveName) {
      if (this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类')
        return false
      }
    },
    // tab切换 切换到商品参数，发起请求
    async tabClick() {
      // 动态属性
      if (this.activeIndex === '1') {
        const cateId = this.addForm.goods_cat[2]
        const { data: res } = await this.$http.get(`categories/${cateId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.message)
        }
        // 商品参数
        // 属性划分成数组
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.goodManyParams = res.data
      } else if (this.activeIndex === '2') {
        // 获取商品静态属性
        const cateId = this.addForm.goods_cat[2]
        const { data: res } = await this.$http.get(`categories/${cateId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.message)
        }
        this.goodOnlyParams = res.data
      } else if (this.activeIndex === '3') {
        console.log('商品图片')
      }
    },
    // 图片成功上传
    successUpload(response) {
      // 1.将临时路径以对象的形式保存
      const pic = { pic: response.data.tmp_path }
      // 2.添加至图片临时路径数组
      this.addForm.pics.push(pic)
    },
    // 预览图片
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.dialogVisible = true
    },
    // 对话框关闭
    dialogClose() {
      this.dialogVisible = false
    },
    // 删除图片——从路径数组中移除
    handleRemove(file) {
      // 1.被删除图片的路径
      const filePath = file.response.data.tmp_path
      // 2.查询在数组中的索引
      const i = this.addForm.pics.findIndex(item => item.pic === filePath)
      // 3.删除数组中的那个元素
      this.addForm.pics.splice(i, 1)
    },
    // 添加商品
    async addGood() {
      // 表单验证
      this.$refs.addFormRef.validate(validate => {
        if (!validate) {
          return this.$message.error('请填写必要信息')
        }
      })
      // 对象深拷贝一份，再修改
      const form = _.cloneDeep(this.addForm)
      form.goods_cat = form.goods_cat.join(',')
      // 处理动、静态参数
      this.goodManyParams.forEach(item => {
        const newInfo = { attr_id: item.attr_id, attr_value: item.attr_value }
        this.addForm.attrs.push(newInfo)
      })
      this.goodOnlyParams.forEach(item => {
        const newInfo = { attr_id: item.attr_id, attr_value: item.attr_value }
        this.addForm.attrs.push(newInfo)
      })
      form.attrs = this.addForm.attrs
      // 发起请求添加商品  名称必须唯一
      const { data: res } = await this.$http.post('goods', form)
      if (res.meta.status !== 201) {
        return this.$message.error(res.meta.message)
      }
      // 跳转到商品列表页面
      this.$router.push('/goods')
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.el-steps {
  margin-top: 20px;
}
/deep/ .el-step__title {
  font-size: 13px !important;
}
.el-tabs {
  margin-top: 20px;
}
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.el-upload__tip {
  font-size: 16px;
  margin-top: 20px;
}
.picture {
  width: 100%;
}
/deep/ .ql-container {
  min-height: 300px;
  font-size: 16px;
}
.add-good-btn {
  margin-top: 15px;
}
</style>
