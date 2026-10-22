<script setup>
import { useThemeStore } from '@/store'
const themeStore = useThemeStore()

const title = import.meta.env.VITE_TITLE
</script>
<template>
    <RouterLink class="logo-container" to='/'>
        <div class="logo-icon-wrapper">
            <!-- logo图标 -->
            <img src='@/assets/img/logo.svg' alt="logo" class="logo-icon" />
            <!-- {{ title }} -->
            <!-- 标题文字：只有侧边栏展开时才显示 -->
            <h2 v-show="!themeStore.collapsed" class="logo-title">
                {{ title }}
            </h2>
        </div>




    </RouterLink>
</template>


<style lang="scss" scoped>
.logo-container {
    // 去除下划线
    text-decoration: none;
    margin: 8px，0px;
}

.logo-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    // flex 元素仅在默认宽度之和大于容器的时候才会发生收缩，其收缩的大小是依据 flex-shrink 的值。
    flex-shrink: 0;
}

.logo-icon {
    width: 50px;
    height: 50px;
}

.logo-title {
    margin-left: 10px;
    font-size: 16px;
    font-weight: bold;
    color: var(--el-color-primary);
    max-width: 150px;
    // 设置了元素溢出时所需的行为，内容将以元素的边距（padding）盒进行裁剪
    overflow: hidden;
    // 用省略号来表示被截断的文本
    text-overflow: ellipsis;

}
</style>