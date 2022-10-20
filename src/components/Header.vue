<template>
  <el-card>
    <div class="header">
      <div class="img-box">
        <img src="../assets/images/cabbage.jpg" alt="logo" width="100%" />
      </div>
      <span class="intro">欢迎使用服装租赁管理系统</span>
      <div class="title">
        <span class="logout">
          <span @click="logout">退出登录</span>
        </span>
      </div>
    </div>
  </el-card>
</template>

<script>
export default {
  name: "Header",
  methods: {
    //退出登陆方法
    logout() {
      window.sessionStorage.removeItem("token");
      //提示退出登录成功
      this.$message({
        message: "已退出登录",
        type: "success",
        center: true,
      });
      //跳转至登陆页面
      this.$router.push("login");
    },
  },
};
</script>
