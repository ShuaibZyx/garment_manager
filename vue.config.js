const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8080, //项目运行的端口号
    host: "localhost",
    open: true,
    https: false,
    proxy: {
      "/api": {
        target: "http://localhost:3006/", //服务端的接口地址
        ws: true,
        changeOrigin: true, //开启跨域
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
});
