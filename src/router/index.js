import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const Home = () => import("../components/Home.vue");
const User = () => import("../views/user/User.vue");
const AddUser = () => import("../views/user/AddUser.vue");
const Garment = () => import("../views/garment/Garment.vue");
const AddGarment = () => import("../views/garment/AddGarment.vue");
const originalPush = VueRouter.prototype.push;

VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

const router = new VueRouter({
  routes: [
    { path: "/", redirect: "/home" },
    {
      path: "/home",
      component: Home,
      redirect: "/user",
      children: [
        { path: "/user", component: User },
        { path: "/user/add", component: AddUser },
        { path: "/garment", component: Garment },
        { path: "/garment/add", component: AddGarment },
      ],
    },
  ],
});

export default router;
