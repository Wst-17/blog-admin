<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goHome() {
    router.push('/home')
}
</script>

<template>
    <el-result icon="warning" title="错误" sub-title="页面跑丢了抱歉，您访问的页面不存在。">
        <template #extra>
            <el-button type="primary" @click="goHome">返回首页</el-button>
        </template>
    </el-result>
</template>