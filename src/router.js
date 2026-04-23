import { createRouter, createWebHashHistory } from "vue-router";

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "home" },
    { path: "/:slug", name: "page" },
  ],
});
