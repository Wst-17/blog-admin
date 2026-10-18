<script setup>
import { useAuthStore } from '@/store';
import { useRoute } from 'vue-router'
const authStore = useAuthStore()
const route = useRoute
// 点击菜单项的回调
function handleCommand(command) {
    if (command === 'logout') {
        ElMessageBox.confirm('确认退出当前账号吗？', '提示', {

            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'

        }).then(() => {
            // 点击确定后，执行退出逻辑
            authStore.logout()
        }).catch(() => {
            // 取消什么都不做
        })
    }
    else if (command === 'profile') {
        route.push('/profile')
    }

}

</script>
<template>
    <el-dropdown trigger="click" @command="handleCommand">
        <el-icon>
            <Setting />
        </el-icon>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item command="profile"><el-icon>
                        <UserFilled />
                    </el-icon>
                    <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item command="logout"><el-icon>
                        <SwitchButton />
                    </el-icon>
                    <span>退出登录</span>
                </el-dropdown-item>

            </el-dropdown-menu>
        </template>
    </el-dropdown>

</template>


<style lang="scss" scoped></style>