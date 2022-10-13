import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    //是否折叠左菜单栏
    isCollapse: false,
  },
  mutations: {
    //设置是否折叠左菜单栏
    SetIsCollapse(state, value) {
      state.isCollapse = value;
    },
  },
  getters: {},
})
