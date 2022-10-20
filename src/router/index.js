import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const Home = () => import("../components/Home.vue");
const Login = () => import("../components/Login.vue");
const User = () => import("../views/user/User.vue");
const AddUser = () => import("../views/user/AddUser.vue");
const Garment = () => import("../views/garment/Garment.vue");
const AddGarment = () => import("../views/garment/AddGarment.vue");
const Hire = () => import("../views/hire/Hire.vue");
const Order = () => import("../views/order/Order.vue");
const AddLogistics = () => import("../views/logistics/AddLogistics.vue");
const originalPush = VueRouter.prototype.push;

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

const router = new VueRouter({
  routes: [
    { path: "/", redirect: "/home" },
    { path: "/login", component: Login },
    {
      path: "/home",
      component: Home,
      redirect: "/user",
      children: [
        { path: "/user", component: User },
        { path: "/user/add", component: AddUser },
        { path: "/garment", component: Garment },
        { path: "/garment/add", component: AddGarment },
        { path: "/hire", component: Hire },
        { path: "/order", component: Order },
        { path: "/addlogistics", component: AddLogistics },
      ],
    },
  ],
});

// 挂载路由前置守卫
router.beforeEach((to, from, next) => {
  //首先判断用户是否已经登录
  const token = JSON.parse(window.sessionStorage.getItem("token"));
  if (to.path !== "/login") {
    if (token) {
      //已经登录
      next();
    } else {
      next("/login");
    }
  } else {
    next();
  }
});

export default router;
