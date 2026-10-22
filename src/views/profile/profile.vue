<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus' // 🌟 Element Plus 的提示
import api from '@/api'
import UploadOne from '@/components/UploadOne.vue' // 引入你的上传组件
import { useUserStore } from '@/store'

const userStore = useUserStore()

const infoFormRef = ref(null)
const infoForm = ref({
    // 用原始 avatar 而不是 userStore.avatar 这个 getter
    avatar: userStore.userInfo.avatar,
    nickname: userStore.nickname,
    intro: userStore.intro,
    website: userStore.website,
})

onMounted(async () => {
    await userStore.getUserInfo()
    infoForm.value = {
        avatar: userStore.userInfo.avatar,
        nickname: userStore.nickname,
        intro: userStore.intro,
        website: userStore.website,
    }
})

const infoLoading = ref(false)
const passwordLoading = ref(false)

// 提交修改
async function updateProfile() {
    if (!infoFormRef.value) return
    await infoFormRef.value.validate(async (valid) => {
        if (!valid) return
        infoLoading.value = true
        try {
            await api.updateCurrent(infoForm.value)
            ElMessage.success('更新成功!') // 🌟 替换 $message
            await userStore.getUserInfo()
        } catch (err) {
            console.error(err)
        } finally {
            infoLoading.value = false
        }
    })
}

// 校验规则
const infoFormRules = {
    nickname: [
        { required: true, message: '请输入昵称', trigger: ['blur', 'change'] },
    ],
}

// 修改密码表单
const passwordFormRef = ref(null)
const passwordForm = ref({
    old_password: '',
    new_password: '',
    confirm_password: '',
})

function updatePassword() {
    if (!passwordFormRef.value) return
    passwordFormRef.value.validate(async (valid) => {
        if (!valid) return
        passwordLoading.value = true
        try {
            await api.updateCurrentPassword(passwordForm.value)
            ElMessage.success('修改成功!') // 🌟 替换 $message
            passwordForm.value = { old_password: '', new_password: '', confirm_password: '' }
        } catch (err) {
            console.error(err)
        } finally {
            passwordLoading.value = false
        }
    })
}

// 🌟 自定义密码校验（Element Plus 必须调用 callback）
function validatePasswordStartWith(rule, value, callback) {
    if (passwordForm.value.new_password && passwordForm.value.new_password.startsWith(value) && passwordForm.value.new_password.length >= value.length) {
        callback()
    } else {
        callback(new Error('两次密码输入不一致'))
    }
}

function validatePasswordSame(rule, value, callback) {
    if (value === passwordForm.value.new_password) {
        callback()
    } else {
        callback(new Error('两次密码输入不一致'))
    }
}

const passwordFormRules = {
    old_password: [
        { required: true, message: '请输入旧密码', trigger: ['blur', 'change'] },
    ],
    new_password: [
        { required: true, message: '请输入新密码', trigger: ['blur', 'change'] },
    ],
    confirm_password: [
        { required: true, message: '请再次输入密码', trigger: ['blur'] },
        { validator: validatePasswordStartWith, trigger: 'input' },
        { validator: validatePasswordSame, trigger: ['blur', 'change'] },
    ],
}
</script>

<template>
    <!-- 🌟 去掉 CommonPage，用 el-card 作为整个页面容器 -->
    <el-card shadow="never" class="profile-page">
        <el-tabs type="border-card" animated>

            <!-- 1. 修改信息面板 -->
            <el-tab-pane label="修改信息">
                <div class="tab-content">

                    <!-- 左侧：头像上传 -->
                    <div class="avatar-wrap">
                        <UploadOne v-model:preview="infoForm.avatar" :width="130" />
                    </div>

                    <!-- 右侧：表单 -->
                    <el-form ref="infoFormRef" label-position="left" label-width="100px" :model="infoForm"
                        :rules="infoFormRules" class="info-form">
                        <el-form-item label="昵称" prop="nickname">
                            <el-input v-model="infoForm.nickname" placeholder="请填写昵称" />
                        </el-form-item>
                        <el-form-item label="个人简介" prop="intro">
                            <el-input v-model="infoForm.intro" placeholder="请填写个人简介" />
                        </el-form-item>
                        <el-form-item label="个人网站" prop="website">
                            <el-input v-model="infoForm.website" placeholder="请填写个人网站" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" :loading="infoLoading" :disabled="infoLoading"
                                @click="updateProfile">
                                修改
                            </el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </el-tab-pane>

            <!-- 2. 修改密码面板 -->
            <el-tab-pane label="修改密码">
                <el-form ref="passwordFormRef" label-position="left" label-width="100px" :model="passwordForm"
                    :rules="passwordFormRules" class="password-form">
                    <el-form-item label="旧密码" prop="old_password">
                        <el-input v-model="passwordForm.old_password" type="password" show-password
                            placeholder="请输入旧密码" />
                    </el-form-item>
                    <el-form-item label="新密码" prop="new_password">
                        <el-input v-model="passwordForm.new_password" :disabled="!passwordForm.old_password"
                            type="password" show-password placeholder="请输入新密码" />
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirm_password">
                        <el-input v-model="passwordForm.confirm_password" :disabled="!passwordForm.new_password"
                            type="password" show-password placeholder="请再次输入新密码" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" :loading="passwordLoading" :disabled="passwordLoading"
                            @click="updatePassword">
                            修改
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-tab-pane>

        </el-tabs>
    </el-card>
</template>

<style scoped>
.profile-page {
    border-radius: 8px;
    min-height: 500px;
}

/* 左右横向布局 */
.tab-content {
    display: flex;
    align-items: flex-start;
    padding: 30px;
}

.avatar-wrap {
    margin-right: 40px;
}

.info-form {
    width: 400px;
}

.password-form {
    padding: 30px;
    width: 400px;
}
</style>