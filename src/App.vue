<script setup>
import { RouterView } from 'vue-router'
import { computed } from 'vue'
// 导入 Element Plus 的中文语言包
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useThemeStore } from '@/store'

const themeStore = useThemeStore()
// Element Plus 通过 html 上的 .dark 类切换暗黑模式
// 这里根据 store 状态同步到 html 标签
import { watchEffect } from 'vue'
watchEffect(() => {
  document.documentElement.classList.toggle('dark', themeStore.darkMode)
})
</script>

<template>
  <!-- <RouterView></RouterView> -->
  <!-- Element Plus 的语言包通过 ElConfigProvider 提供 -->
  <el-config-provider :locale="zhCn">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </el-config-provider>
</template>
