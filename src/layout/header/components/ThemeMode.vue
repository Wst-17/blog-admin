<script setup>
import { useThemeStore } from '@/store'
import { Moon } from '@element-plus/icons-vue';

const themeStore = useThemeStore()


</script>

<template>
    <el-icon size="18" @click="themeStore.switchDarkMode">
        <el-icon>
            <Moon v-if="themeStore.darkMode" />
            <Sunny v-else />
        </el-icon>

    </el-icon>
</template>
<style lang="scss" scoped></style>