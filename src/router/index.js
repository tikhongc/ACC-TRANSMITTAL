import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/transmittals',
  },
  {
    path: '/transmittals',
    name: 'TransmittalList',
    component: () => import('@/views/TransmittalList.vue'),
    meta: {
      title: 'Transmittals',
    },
  },
  {
    path: '/transmittals/:id',
    name: 'TransmittalDetail',
    component: () => import('@/views/TransmittalDetail.vue'),
    meta: {
      title: 'Transmittal Detail',
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to update page title
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'ACC Transmittal';
  next();
});

export default router;
