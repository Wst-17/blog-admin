<script setup>
import { useThemeStore } from '@/store'

const themeStore = useThemeStore()


</script>

<template>
    <el-icon size="18" @click="themeStore.switchDarkMode">
        <el-icon>
            <Sunny v-if="themeStore.darkMode" />
            <Moon v-else />
        </el-icon>

    </el-icon>
</template>
<style lang="scss" scoped></style>