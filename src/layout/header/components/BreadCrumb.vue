<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router'
import { HomeFilled, Document, Setting, User } from '@element-plus/icons-vue'

const route = useRoute()
//  过滤出有 title 的路由
const breadcrumbs = computed(() => {
  // route.matched 是一个数组，包含了当前 URL 从“最外层父路由”到“当前最底层子路由”的所有匹配记录。
  // !!这是一个双重否定，它的唯一作用是把任何值强行转换成布尔值
  // ?.（可选链）：这是防崩溃神器
  return route?.matched.filter(item => !!item.meta?.title)



})
// 图标映射表
const iconMap = {
  home: HomeFilled,
  document: Document,
  setting: Setting,
  user: User,
}
// 获取图标
function getIcon(meta) {
  if (!meta?.icon) return null
  // 如果 icon 是字符串，从映射表里取；如果是组件，直接用
  return typeof meta.icon === 'string' ? iconMap[meta.icon] : meta.icon
}

</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path"
      :to="item.path !== route.path ? { path: item.path } : undefined">
      <!-- 图标（如果有） -->
      <el-icon v-if="getIcon(item.meta)" class="bread-icon">
        <component :is="getIcon(item.meta)" />
      </el-icon>
      <!-- 获取标题 -->
      <span>{{ item.meta?.title }}</span>
    </el-breadcrumb-item>

  </el-breadcrumb>
</template>

<style scoped>
.bread-icon {
  margin-right: 4px;
  vertical-align: middle;
}
</style>