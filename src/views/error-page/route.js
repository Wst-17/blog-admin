export default {
  name: 'Error',
  path: '/error',
  component: () => import('./404.vue'),
  meta: {
    title: '错误页',
    icon: 'mdi:alert-circle-outline',
    order: 99,
  },
}
