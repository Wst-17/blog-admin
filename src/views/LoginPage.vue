<script setup>
import { ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { useStorage } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'

import api from '@/api'

import { addDynamicRoutes } from '@/router'
import { useAuthStore, useUserStore } from '@/store'
import { getLocal, removeLocal, setLocal } from '@/utils'

// const userStore = useUserStore()
// const authStore = useAuthStore()

// const router = useRouter()
// const route = useRoute()



//从环境变量中读
const title = import.meta.env.VITE_TITLE
// 使用mock模式
const isMock = import.meta.env.VITE_USE_MOCK === 'ture'

//1.准备表单对象
// Mock 模式预填账号
const loginForm = ref({
    account: isMock ? 'guest' : '',
    password: isMock ? '123456' : ''
})
// 2.表单规则
const rules = {
    username: [
        { required: true, message: '账号不能为空', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '密码不能为空', trigger: 'blur' },
        { min: 6, max: 14, message: '密码长度为6-14', trigger: 'blur' }
    ]
}
// const loginFormRef = ref(null)
// const isRemember = ref(false)
// const loading = ref(false)

// // 初始化：从 localStorage 回填“记住我”
// onMounted(() => {
//     const localLoginInfo = getLocal('loginInfo')
//     if (localLoginInfo) {
//         loginForm.username = localLoginInfo.username
//         loginForm.password = localLoginInfo.password
//         isRemember.value = true // 回填时勾选记住我
//     }
// })

// async function handleLogin() {
//     if (!loginFormRef.value) return

//     await loginFormRef.value.validate(async (valid) => {
//         if (!valid) return

//         const { username, password } = loginForm
//         const doLogin = async () => {
//             loading.value = true
//             try {
//                 // 1. 登录接口
//                 const resp = await api.login({ username, password })
//                 authStore.setToken(resp.data.token)

//                 // 2. 拉用户信息 + 动态路由
//                 await userStore.getUserInfo()
//                 await addDynamicRoutes()

//                 // 3. 处理“记住我”（修复了原代码直接赋值覆盖 Ref 的 bug）
//                 if (isRemember.value) {
//                     setLocal('loginInfo', { username, password })
//                 } else {
//                     removeLocal('loginInfo')
//                 }
//                 ElMessage.success('登录成功')

//                 // 4. 跳转
//                 const redirect = route.query.redirect
//                 if (redirect) {
//                     router.replace({ path: redirect })
//                 } else {
//                     router.replace('/')
//                 }
//             } catch (err) {
//                 console.error('登录失败：', err)
//                 ElMessage.error(err?.message || '登录失败')
//             } finally {
//                 loading.value = false
//             }
//         }

//         doLogin()
//     })
// }
</script>


<template>
    <!-- 最外层背景容器 -->
    <div class="login-page-container">
        <!-- 登录卡片主体 -->
        <div class="login-card">

            <!-- 左侧：插画区域 (响应式：小屏隐藏) -->
            <div class="login-left">
                <!-- 建议使用 import 或 @ 别名引入图片 -->
                <img src="../assets/img/loginbjt2.jpg" alt="login_banner" class="illustration" />
            </div>

            <!-- 右侧：表单区域 -->
            <div class="login-right">
                <!-- 标题和 Logo -->
                <div class="title-container">
                    <!-- <img src="@/assets/image/logo.svg" alt="logo" class="logo" /> -->
                    <h2 class="title">{{ title }}</h2>
                </div>

                <!-- Element Plus 表单 -->
                <!-- 注意：ref 和 :model 配合，rules 用于校验 -->
                <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form" size="large">
                    <!-- 用户名 -->
                    <el-form-item label="账号" prop="username">
                        <el-input type="username" placeholder="请输入账号" v-model="loginForm.username">
                            <template #prefix>
                                <el-icon>
                                    <User />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>

                    <!-- 密码 -->
                    <el-form-item label="密码" prop="password" maxlength="20" show-password>
                        <!-- @keyup.enter="handleLogin" -->
                        <el-input type="password" placeholder="请输入密码" v-model="loginForm.password">
                            <template #prefix>
                                <el-icon>
                                    <Lock />
                                </el-icon>
                            </template>
                        </el-input>
                    </el-form-item>

                    <!-- 记住我 -->
                    <el-form-item>

                        <el-checkbox>记住我</el-checkbox>
                        <!-- v-model="isRemember" -->
                    </el-form-item>

                    <!-- 登录按钮 -->
                    <el-form-item>
                        <el-button type="primary" class="login-button">
                            <!--  :loading="loading" @click="handleLogin" -->
                            登录
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>

        </div>
    </div>
</template>
<style lang="scss" scoped>
/* 1. 全局重置（如果项目里有全局样式，这里可以省略） */
* {
    box-sizing: border-box;
}

/* 2. 最外层背景容器 */
.login-page-container {
    display: flex;
    /* 交叉轴居中 垂直居中 */
    align-items: center;
    /* 主轴居中 水平居中 */
    justify-content: center;
    min-height: 100vh;
    /* 背景图放在这里，比行内 style 更容易生效 */
    background-image: url('../assets/img/loginbst.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

/* 3. 登录卡片 */
.login-card {
    display: flex;
    width: 700px;
    /* 约等于 380 + 320 */
    max-width: 95%;
    /* 小屏时自适应 */
    background-color: rgba(255, 255, 255, 0.6);
    /* bg-white bg-opacity-60 */
    border-radius: 16px;
    /* rounded-2 (对应通常的 16px) */
    padding: 16px;
    /* p-4 */
    box-shadow: 10px 10px 30px rgba(0, 0, 0, 0.1);
    /* shadow */
    /* 如果你有 transform: translateY(25px)，可以加在这里 */
    /* transform: translateY(25px); */
}

/* 4. 左侧插画区域 */
.login-left {
    display: block;
    /* 默认显示 */
    width: 380px;
    padding: 36px 20px;
    /* px-5 py-9 */
    flex-shrink: 0;
    /* 防止被压缩 */
}

.illustration {
    width: 100%;
    height: auto;
    /* 被替换的内容将被缩放，以在填充元素的内容框时保持其宽高比 */
    object-fit: contain;
}

/* 5. 右侧表单区域 */
.login-right {
    display: flex;
    flex-direction: column;
    width: 320px;
    padding: 36px 16px;
    /* px-4 py-9 */
}

/*  6. 标题样式 */
.title-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 22px;
    /* 对应 space-y-5.5 的间距 */
}

/* .logo {
    width: 50px;
    height: 50px;
    margin-right: 8px;
} */

.title {
    font-size: 24px;
    font-weight: 400;
    color: #4b5563;
    /* 类似 gray 字体色 */
    margin: 0;
}

/* 7. 调整 Element Plus 表单元素 */
.login-form {
    width: 100%;
}

/* 覆盖 Element Plus 默认的表单项间距，使其匹配你的设计 */
:deep(.el-form-item) {
    margin-bottom: 22px;
    /* 对应 space-y-5.5 */
}

/* 让输入框高度变高，类似你原代码的 h-[50px] */
:deep(.el-input__wrapper) {
    height: 50px;
    border-radius: 8px;
    /* 稍微加一点圆角 */
}

/* 让登录按钮撑满并变高 */
.login-button {
    width: 100%;
    height: 50px;
    border-radius: 5px;
    /* rounded-5 */
    font-size: 16px;
}

/* 8. 响应式设计：小屏隐藏左侧插画 */
@media (max-width: 768px) {
    .login-left {
        display: none;
    }

    .login-card {
        width: 345px;
        /* 小屏时的最小宽度 */
    }

    .login-right {
        width: 100%;
        /* 小屏时占满卡片宽度 */
    }
}
</style>