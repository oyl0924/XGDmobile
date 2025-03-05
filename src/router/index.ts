import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      keepAlive: false
    }
  },
  {
    path: '/report',
    name: 'ReportList',
    component: () => import('@/views/ReportList.vue'),
    meta: {
      title: '报工列表',
      keepAlive: true
    }
  },
  {
    path: '/work-order',
    name: 'WorkOrderList',
    component: () => import('@/views/WorkOrderList.vue'),
    meta: {
      title: '工单',
      keepAlive: true
    }
  },
  {
    path: '/task',
    name: 'TaskList',
    component: () => import('@/views/TaskList.vue'),
    meta: {
      title: '任务',
      keepAlive: true
    }
  },
  {
    path: '/my-profile',
    name: 'MyProfile',
    component: () => import('@/views/MyProfile.vue'),
    meta: {
      title: '我的',
      keepAlive: true
    }
  },
  {
    path: '/change-password',
    name: 'ChangePassword',
    component: () => import('@/views/ChangePassword.vue'),
    meta: {
      title: '修改密码',
      keepAlive: false
    }
  },
  {
    path: '/update-log',
    name: 'UpdateLog',
    component: () => import('@/views/UpdateLog.vue'),
    meta: {
      title: '更新日志',
      keepAlive: false
    }
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
    path: '/report-detail',
    name: 'ReportDetail',
    component: () => import('@/views/WorkReport.vue'), // 暂时复用报工提交页面
    meta: {
      title: '报工详情',
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