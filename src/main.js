import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // 🌟 暗黑模式样式
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@/style/theme.css'

import { setupStore } from '@/store'
import { setupRouter } from '@/router'

async function bootstrap() {
  const app = createApp(App)

  // 1. 注册 Element Plus 所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 2. 安装 Element Plus（带中文）
  app.use(ElementPlus, {
    locale: zhCn,
  })

  // 3. 安装 Pinia（这里 setupStore 内部会执行 app.use(pinia)）
  setupStore(app)

  // 4. 安装路由（⚠️ 必须加 await，等动态路由和守卫都装好）
  await setupRouter(app)

  // 5. 最后挂载
  app.mount('#app')
}

// 执行启动函数
bootstrap()
