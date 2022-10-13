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
      this.$message.success("已退出登录");
      //跳转至登陆页面
      this.$router.push("login");
    },
  },
};
</script>

<style lang="less">
.header {
  width: 100%;
  padding: 5px 20px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  .img-box {
    width: 30px;
    border-radius: 5px;
    overflow: hidden;
  }
  .title {
    font-family: 楷体;
    font-weight: bolder;
    .logout {
      font-size: large;
    }
    .logout :hover {
      cursor: pointer;
      color: skyblue;
    }
  }
  .intro {
    font-size: 1.6em;
    font-family: 楷体;
    color: transparent;
    background-image: linear-gradient(
      to right,
      rgb(161, 161, 150),
      rgb(0, 0, 0)
    );
    background-clip: text;
    user-select: none;
    font-weight: 1000;
  }
}
</style>
