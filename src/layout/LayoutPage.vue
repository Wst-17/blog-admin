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
        <el-container class="layout-right-container">
            <!-- 头部 -->
            <el-header class="layout-header">
                <Appheader></Appheader>
            </el-header>
            <!-- 页面内容 -->
            <el-main class="layout-main">
                <RouterView></RouterView>
            </el-main>
        </el-container>
    </el-container>
</template>
