<template>
  <el-container>
    <el-header>
      <Header />
    </el-header>
    <el-container>
      <el-aside style="margin-top: 22px" :width="isCollapse ? '70px' : '180px'">
        <Aside />
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Aside from "./Aside.vue";
import Header from "./Header.vue";
export default {
  name: "Home",
  computed: {
    isCollapse() {
      return this.$store.state.isCollapse;
    },
  },
  components: {
    Aside,
    Header
  },
};
</script>
