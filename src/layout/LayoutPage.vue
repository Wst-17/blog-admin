<script setup>
import Appheader from '@/layout/header/index.vue'
import AppSide from '@/layout/sidebar/index.vue'

import { useThemeStore } from '@/store'
const themeStore = useThemeStore()

</script>

<template>
    <!-- 最外层容器，绝对占满屏幕 -->
    <el-container class="layout-container">
        <!-- 左侧侧边栏 -->
        <el-aside :width="themeStore.collapsed ? '64px' : '220px'" class="layout-aside">
            <AppSide />
        </el-aside>
        <!-- 右侧主体结构 -->
        <el-container class="layout-right">
            <!-- 头部 -->
            <el-header class="layout-header">
                <Appheader></Appheader>
            </el-header>
            <!-- 标签栏容器 -->
            <!-- <section v-if="theme.tags.visible" class="tags-container">
                <AppTags :style="{ height: `${theme.tags.height}px` }" />
            </section> -->
            <!-- 页面内容 -->
            <el-main class="layout-main">
                <RouterView></RouterView>
            </el-main>
        </el-container>
    </el-container>
</template>
<style scoped>
/* 1. 最外层容器：绝对占满全屏 */
.layout-container {
    height: 100vh;
    width: 100vw;
    /* 强制隐藏最外层的滚动条 */
    overflow: hidden !important;

}

/* 2. 侧边栏：平滑过渡，固定宽度不可压缩 */
.layout-aside {
    transition: width 0.3s ease;
    /* background-color: #ffffff; */
    border-right: 1px solid var(--el-border-color-light, #e5e7eb);
    overflow: hidden;
    flex-shrink: 0;
    /* 防止侧边栏被挤压 */
}

/* 3. 右侧主体：垂直排列 */
.layout-right {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

/* 4. 头部：固定高度，底部加线 */
.layout-header {
    display: flex;
    align-items: center;
    padding: 0 16px;
    /* background-color: #ffffff; */
    border-bottom: 1px solid var(--el-border-color-light, #e5e7eb);
    flex-shrink: 0;
}

/* 5. 标签栏：底部加线 */
/* .layout-tags {
    background-color: #ffffff;
    border-bottom: 1px solid var(--el-border-color-light, #e5e7eb);
    flex-shrink: 0;
} */

/* 6. 内容区：占满剩下空间，内部独立滚动 */
.layout-main {
    flex: 1;
    padding: 16px;
    background-color: var(--el-bg-color-page);
    overflow-y: auto;
}
</style>