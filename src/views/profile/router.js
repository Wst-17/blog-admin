export default {
  name: 'Profile',
  path: '/profile',
  component: () => import('./index.vue'),
  meta: {
    title: '个人中心',
    icon: 'mdi:account',
    order: 8,
  },
}
