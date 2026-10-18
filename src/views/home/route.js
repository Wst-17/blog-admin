const Layout = () => import('@/layout/LayoutPage.vue')

export default {
  name: 'Home',
  path: '/',
  component: Layout,
  //   访问 / 时，自动跳到 /home
  redirect: '/home',
  //   自定义字段。
  meta: {
    // order: 0：排序序号，用于在侧边栏菜单里排序。数字越小越靠前
    order: 0,
  },
  //   标记这个路由是"目录"，不直接对应页面
  isCatalogue: true,
  children: [
    {
      name: 'Home2',
      path: 'home2',
      component: () => import('./index.vue'),
      meta: {
        title: '首页',
        icon: 'ic:sharp-home',
        order: 0,
      },
    },
  ],
}
