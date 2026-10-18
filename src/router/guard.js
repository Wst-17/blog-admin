import { useAuthStore } from '@/store'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css' // 引入默认样式

NProgress.configure({
  showSpinner: false, // 不显示右上角的转圈圈
  minimum: 0.1, // 初始最小百分比
  speed: 500, // 动画速度
})

export function setupRouterGuard(router) {
  createPageLoadingGuard(router)
  createPermissionGuard(router)
  createPageTitleGuard(router)
}

/**
 * 根据导航设置顶部加载条的状态
 */
function createPageLoadingGuard(router) {
  router.beforeEach(() => {
    NProgress.start()
  })
  router.afterEach(() => setTimeout(() => NProgress.done(), 200))
  // 在导航期间每次发生未捕获的错误时都会调用该处理程序
  router.onError(() => {
    NProgress.done()
  })
}

/**
 * 根据有无 Token 判断能否访问页面
 */
function createPermissionGuard(router) {
  // const base = import.meta.env.VITE_BASE_URL
  // 路由前置守卫: 根据有没有 Token 判断前往哪个页面
  router.beforeEach(async (to) => {
    const { token } = useAuthStore()

    // 没有 Token
    if (!token) {
      // login 和 404 不需要 token 即可访问
      if (['/login', '/404'].includes(to.path)) {
        return true
      }

      ElMessage.error('没有 Token，请先登录！')
      // 重定向到登录页, 并且携带 redirect 参数, 登录后自动重定向到原本的目标页面
      return { name: 'Login', query: { ...to.query, redirect: to.path } }
    }

    // 有 Token 的时候无需访问登录页面
    if (to.name === 'Login') {
      ElMessage.success('已登录，无需重复登录！')
      return { path: '/' }
    }

    // 能在路由中找到, 则正常访问
    if (router.getRoutes().some((e) => e.name === to.name)) {
      return true
    }

    // TODO: 刷新 Token
    // await refreshAccessToken()

    // TODO: 判断是无权限还是 404
    return { name: '404', query: { path: to.fullPath } }
  })
}

/**
 * 根据路由元信息设置页面标题
 */
function createPageTitleGuard(router) {
  const baseTitle = import.meta.env.VITE_TITLE
  router.afterEach((to) => {
    const pageTitle = to.meta?.title
    document.title = pageTitle ? `${pageTitle} | ${baseTitle}` : baseTitle
  })
}
