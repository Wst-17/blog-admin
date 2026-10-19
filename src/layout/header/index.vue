<script setup>
import BreadCrumb from './components/BreadCrumb.vue'
import FullScreen from './components/FullScreen.vue'
// import GithubSite from './components/GithubSite.vue'
import MenuCollapse from './components/MenuCollapse.vue'
import Setting from './components/Setting.vue'
import ThemeMode from './components/ThemeMode.vue'
import UserAvatar from './components/UserAvatar.vue'
// import Watermark from './components/Watermark.vue'
</script>

<template>
    <div class="header-container">
        <div class="header-left">
            <!-- 侧边栏折叠按钮 -->
            <MenuCollapse />
            <!-- 面包屑导航 -->
            <BreadCrumb class="mt-1.5" />
        </div>
        <div class="header-right">
            <!-- Github 网址图标 -->
            <!-- <GithubSite /> -->
            <!-- 切换模式 -->
            <ThemeMode />
            <!-- 水印 -->
            <!-- <Watermark /> -->
            <!-- 全屏按钮 -->
            <FullScreen />
            <!-- 用户头像 -->
            <UserAvatar />
            <!-- 设置 -->
            <Setting />
        </div>
    </div>
</template>
<style scoped>
/* 整个头部容器：两端对齐，垂直居中 */
.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* 左边靠左，右边靠右 */
    width: 100%;
    height: 100%;
    padding: 0 16px;
    border: 1px solid #e5e7eb;
}

.header-left {
    display: flex;
    align-items: center;
    /* 用于设置行与列之间的间隙 */
    gap: 12px;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 20px
}
</style>