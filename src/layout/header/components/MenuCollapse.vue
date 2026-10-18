<!-- 侧边栏折叠组件 -->
<script setup>
import { useThemeStore } from '@/store/modules/theme'

const themeStore = useThemeStore()
</script>
<template>

    <el-icon size="18" @click="themeStore.switchCollapsed()">
        <Expand v-if="themeStore.collapsed" />
        <Fold v-else />
    </el-icon>

</template>
