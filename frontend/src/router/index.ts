import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Boarding",
    component: () => import("@/pages/Boarding"),
  },
  {
    path: "/rocket",
    name: "Rocket",
    component: () => import("@/pages/Rocket"),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/NotFound"),
  },
] as RouteRecordRaw[];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
