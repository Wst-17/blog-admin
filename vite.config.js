import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
//按需导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vite.dev/config/
// 导入mock Mock（模拟数据它的作用是：在后端接口还没写好时，前端能自己造数据，让页面先跑起来。
import { viteMockServe } from 'vite-plugin-mock'
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    viteMockServe({
      mockPath: 'mock', // mock 文件放在项目根目录的 mock 文件夹
      enable: true, // 开发 + 构建都启用（适合 GitHub Pages 演示站）
      logger: true, // 控制台打印 mock 请求日志，方便调试
    }),
  ],
  build: {
    // 告诉 Vite 使用 esbuild 进行 CSS 压缩，绕过 LightningCSS 的兼容问题
    cssMinify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
