<template>
  <div id="aside">
    <el-menu
      class="el-menu-vertical-demo"
      :collapse-transition="false"
      :router="true"
      :collapse="isCollapse"
      :default-active="$route.path"
    >
      <el-menu-item index="/user">
        <i class="el-icon-user" />
        <template slot="title">
          <span slot="title">用户信息管理</span>
        </template>
      </el-menu-item>
      <el-menu-item index="/user">
        <i class="el-icon-user" />
        <template slot="title">
          <span slot="title">用户信息管理</span>
        </template>
      </el-menu-item>

      <el-menu-item index="/garment">
        <i class="el-icon-goods" />
        <template slot="title">
          <span slot="title">服装信息管理</span>
        </template>
      </el-menu-item>

      <el-menu-item index="/hire">
        <i class="el-icon-box" />
        <template slot="title">
          <span slot="title">租赁信息管理</span>
        </template>
      </el-menu-item>

      <el-menu-item index="/order">
        <i class="el-icon-tickets" />
        <template slot="title">
          <span slot="title">订单信息管理</span>
        </template>
      </el-menu-item>

      <el-menu-item>
        <i
          class="el-icon-arrow-right"
          v-if="isCollapse"
          @click="unCollapse"
        />
        <i
          class="el-icon-arrow-left"
          v-if="!isCollapse"
          @click="collapse"
        />
        <template slot="title">
          <span slot="title" v-if="isCollapse" @click="unCollapse"
            >展开</span
          >
          <span slot="title" v-if="!isCollapse" @click="collapse">折起</span>
        </template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  name: "Aside",
  data() {
    return {
      isCollapse: false,
    };
  },
  methods: {
    //折叠所用方法
    collapse() {
      this.isCollapse = true;
      this.$store.commit("SetIsCollapse", this.isCollapse);
    },
    //展开所用方法
    unCollapse(){
      this.isCollapse = false;
      this.$store.commit("SetIsCollapse", this.isCollapse);
    }
  },
};
</script>
