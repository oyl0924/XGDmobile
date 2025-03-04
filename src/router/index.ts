import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/work-report',
  },
  {
    path: '/work-report',
    name: 'WorkReport',
    component: () => import('@/views/WorkReport.vue'),
    meta: {
      title: '报工',
      keepAlive: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: '404',
      keepAlive: false
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '移动端报工系统'}`;
  next();
});

export default router; 