<script setup>
import { useUserStore } from '@/store'

const userstore = useUserStore()
</script>
<template>
    <div class="user-info">
        <el-avatar :size="40" :src="userstore.avatar" />
        <span class="nickname"> {{ userstore.nickname }}</span>
    </div>

</template>

<style lang="scss" scoped>
.user-info {
    display: flex;
    align-items: center;
    outline: none;
}

.nickname {
    margin: 0 6px;
    font-size: 14px;
    color: #333;
    /* 防止名字太长把头部撑爆 */
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>