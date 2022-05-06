<template>
  <div class="roles">
    <!-- 导航区域 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              type="flex"
              align="middle"
              :class="['border-bottom', index === 0 ? 'border-top' : '']"
              v-for="(item1, index) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限列 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限列 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, index) in item1.children"
                  :key="item2.id"
                  type="flex"
                  align="middle"
                  :class="[index === 0 ? '' : 'border-top']"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col>
                    <el-tag
                      type="warning"
                      :span="18"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showAssignPermission(scope.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="assignPermissionVisible">
      <el-tree
        :data="rightsTree"
        show-checkbox
        default-expand-all
        node-key="id"
        ref="rightsTreeRef"
        highlight-current
        :props="defaultProps"
        :default-checked-keys="defKeys"
      >
      </el-tree>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignPermissionVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignPermission">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AuthorityRoles',
  data() {
    return {
      // 角色列表
      roleList: [],
      // 控制分配权限对话框
      assignPermissionVisible: false,
      // tree权限列表
      rightsTree: [],
      // 节点设置
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的节点id
      defKeys: [],
      // 分配权限对话框的id
      assignPermissionId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.roleList = res.data
    },
    // 删除权限按钮
    async removeRightById(role, rightId) {
      // 弹框提示
      const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果点击的不是确认，就取消
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 点击确认，删除权限
      this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error(res.data.meta.msg)
        }
        // 重新赋值权限数据
        role.children = res.data.data
      })
    },
    // 分配权限弹框
    async showAssignPermission(role) {
      // 获取所有权限tree
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.rightsTree = res.data
      // 获取前清空数据
      this.defKeys = []
      // 获取当前角色的三级权限id
      this.getLeafKeys(role, this.defKeys)
      // 保存分配权限对话框的id
      this.assignPermissionId = role.id
      this.assignPermissionVisible = true
    },
    // 通过递归获取角色下的所有三级权限的id,并保存至defKeys
    getLeafKeys(node, arr) {
      // 如果不包含children，则为三级权限
      if (!node.children) {
        return arr.push(node.id)
      }
      // 递归获取
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 分配权限
    assignPermission() {
      // 获取全选的权限节点
      const keys = [
        // 获取全选的权限节点
        ...this.$refs.rightsTreeRef.getCheckedKeys(),
        // 获取半全选的权限节点
        ...this.$refs.rightsTreeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      // 分配权限
      this.$http.post(`roles/${this.assignPermissionId}/rights`, { rids: idStr }).then(res => {
        if (res.data.meta.status === 200) {
          this.$message.success('分配角色权限成功')
        }
      })
      this.getRoleList()
      this.assignPermissionVisible = false
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
.el-tag {
  margin: 7px;
}
.border-top {
  border-top: 1px solid #eee;
}
.border-bottom {
  border-bottom: 1px solid #eee;
}
</style>
