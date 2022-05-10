<template>
  <el-dialog title="修改参数" :visible.sync="dialogVisible" @close="dialogClose">
    <!-- 添加参数表单 -->
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
      <el-form-item label="动态参数" prop="attr_name">
        <el-input v-model="form.attr_name"></el-input>
      </el-form-item>
    </el-form>
    <slot name="content"></slot>
    <!-- 底部-确认和取消按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editParamsBtn">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'EditParamsDialog',
  data() {
    return {
      dialogVisible: false,
      // 表单的绑定值
      form: {
        attr_name: ''
      },
      // 添加用户表单验证规则
      formRules: {
        attr_name: [
          { required: true, message: '请输入参数', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      // 参数id
      paramsId: 0
    }
  },
  props: {
    // many/only
    activeName: {
      type: String,
      default: ''
    },
    // 选中的三级分类id
    selectedKeys: {
      type: Number,
      default: 0
    }
  },
  methods: {
    // 确定修改参数-预验证-发起请求-关闭对话框
    editParamsBtn() {
      this.$refs.formRef.validate(validate => {
        if (!validate) return false
        this.addParams()
        this.dialogVisible = false
      })
    },
    // dialog关闭-重置对话框表单、刷新表格
    dialogClose() {
      this.$refs.formRef.resetFields()
    },
    // 发起请求修改参数
    addParams() {
      this.$http
        .put(`categories/${this.selectedKeys}/attributes/${this.paramsId}`, {
          attr_name: this.form.attr_name,
          attr_sel: this.activeName
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error(res.data.meta.msg)
          }
          // 发射事件至父组件，重新获取数据-渲染表格
          // （获取请求是异步任务的原因，确保数据更新后再发送请求渲染页面）
          this.$emit('getTable')
        })
    }
  }
}
</script>

<style></style>
