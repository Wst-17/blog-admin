// const Layout = () => import('@/layout/LayoutPage.vue')

export default {
  name: 'Home', // 🌟 路由名称，必须唯一（用于 KeepAlive 缓存）
  path: '/home', // 🌟 浏览器地址栏访问路径
  component: () => import('./index.vue'), // 🌟 引入同级目录下的组件
  meta: {
    title: '首页', // 🌟 左侧菜单和面包屑显示的文字
    icon: 'ic:sharp-home', // 🌟 左侧菜单显示的图标（Element Plus 图标名）
    keepAlive: true, // 🌟 是否缓存该页面（可选）
    order: 1, // 🌟 菜单排序（数字越小越靠前）
  },
}

// const Layout = () => import('@/layout/index.vue')

// export default {
//   name: 'Home',
//   path: '/',
//   component: Layout,
//   redirect: '/home2', // 🌟 修复：重定向必须和子路由的 path 完全一致
//   meta: {
//     order: 0,
//     hidden: true, // 🌟 建议加上：这个外壳不需要在菜单里显示，只显示子菜单
//   },
//   isCatalogue: true, // 你底层的逻辑依赖这个字段，保留
//   children: [
//     {
//       name: 'Home2',
//       path: 'home2', // 拼接后就是 /home2
//       component: () => import('./index.vue'),
//       meta: {
//         title: '首页',
//         icon: 'ic:sharp-home', // 🌟 这个图标必须在你的 iconMap 里映射成 Element Plus 组件
//         order: 0,
//       },
//     },
//   ],
// }
