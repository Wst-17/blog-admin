<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, TurnOff } from '@element-plus/icons-vue'
import { request } from '@/utils';
import { useUserStore } from '@/store'
import api from '@/api';
// 它们的作用是让父组件（比如个人中心页面）和子组件（上传组件）能够互相说话、传递数据
// 接收父组件传来的数据
// const props = defineProps({
//   preview: { type: String, default: '' }
// })
// //  向父组件派发事件
// const emit = defineEmits(
//   ['upload:preview']
// )
// const imageUrl = ref('props.review')

// // 同步外部传入的头像
// watch(() => props.preview, (val) => {
//   imageUrl.value = val
// })
const userStore = useUserStore()

const infoFormRef = ref(null)
const infoLoading = ref(false)
const infoForm = ref({
  avatar: userStore.userInfo.avatar,
  nickname: userStore.userInfo.nickname,
  website: userStore.userInfo.website,
  intro: userStore.userInfo.intro
})
// 规则
const rules = ref({
  nickname: [
    { required: true, message: '用户名不能为空', trigger: 'blur' }
  ]

})
// 修改按钮
async function updateProfile() {
  // 1. 确保表单实例存在
  if (!infoFormRef.value) return
  await infoFormRef.value.validate(async (valid) => {
    // 2.校验不成功，直接中断
    if (!valid) return
    // 启动loading
    infoLoading.value = true
    try {
      // 将表单数据传给mock(或后台)
      await api.updateCurrent(infoForm.value)
      ElMessage.success('更新成功!')
      // 重新拉取最新用户信息，同步到全局 Store
      await userStore.getUserInfo()

    } catch (err) {
      console.log(err)
    } finally {
      infoLoading.value = false
    }
  })

}

// 上传图片限制
const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    ElMessage.error('上传的图片必须为JPG!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('上传的图片不能超过2MB!')
    return false
  }
  return true
}

const handleAvatarChange = async (uploadFile) => {
  const rawFile = uploadFile.raw
  if (!rawFile) return

  // 1. 先把本地预览图展示出来，让用户立刻看到变化
  const blobUrl = URL.createObjectURL(rawFile)
  infoForm.value.avatar = blobUrl

  // 2. 悄悄把文件传给 Mock，换取真实存储地址,formData.append(name, value)
  const formData = new FormData()
  formData.append('file', rawFile)

  try {
    const res = await request.post('/upload', formData)
    // 3. 拿到 Mock 返回的持久化 URL，覆盖掉临时的 blob 地址
    infoForm.value.avatar = res.data.url
    ElMessage.success('图片上传成功')
  } catch (err) {
    ElMessage.error('上传失败')
    console.error(err)
  }
}

// 修改密码表单
const passwordFormRef = ref('')
const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''

})
const passwordLoading = ref(false)
// Element Plus 自定义校验
// 软校验，边打边查
function validatePasswordStartWith(rule, value, callback) {
  // 边输边校验
  // 判断当前字符串是否以指定的子字符串（value）开头
  // value 就是用户刚刚在“确认密码”框里敲下的字符
  // passwordForm.value.new_password 是用户之前输入的“新密码”
  if (passwordForm.value.new_password && passwordForm.value.new_password.startsWith(value)) {
    callback()
  } else {
    callback(new Error('两次密码输入不一致'))
  }
}
// （硬校验，最终把关）
function validatePasswordSame(rule, value, callback) {
  if (value === passwordForm.value.new_password) {
    callback()
  } else {
    callback(new Error('两次密码输入不一致'))
  }
}
// 修改密码规则
const passwordFormRules = ref({
  old_password: [
    { required: true, message: '请输入旧密码', trigger: ['blur', 'change'] }
  ],
  new_password: [
    { required: true, message: '请输入新密码', trigger: ['blur', 'change'] }
  ],
  confirm_password: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePasswordStartWith, trigger: 'input' },
    { validator: validatePasswordSame, trigger: ['blur', 'change'] }
  ]
})
// 提交修改密码
async function updatePassword() {
  // 1. 确保表单实例存在
  if (!passwordFormRef.value) return
  await passwordFormRef.value.validate(async (valid) => {
    // 2.校验不成功，直接中断
    if (!valid) return
    // 启动loading
    passwordLoading.value = true
    try {
      // 将表单数据传给mock(或后台)
      await api.updateCurrentPassword(passwordForm.value)
      ElMessage.success('更新成功!')
      passwordForm.value = { old_password: '', new_password: '', confirm_password: '' }

    } catch (err) {
      console.log(err)
    } finally {
      passwordLoading.value = false
    }
  })

}

</script>
<template>
  <el-card class="profile-card">
    <!-- 修改信息面板 -->
    <el-tabs type="border-card" class="tab">
      <el-tab-pane label="修改信息">
        <div class="card-first">
          <el-upload class="avatar-uploader" action="#" :show-file-list="false" :on-change="handleAvatarChange"
            :before-upload="beforeAvatarUpload">
            <img v-if="infoForm.avatar" :src="infoForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
          <!-- 表单修改信息 -->
          <el-form class="info-form" label-position="left" label-width="80px" :model="infoForm" ref="infoFormRef"
            :rules="rules">
            <el-form-item label="用户名" prop="nickname">
              <el-input v-model="infoForm.nickname" />
            </el-form-item>
            <el-form-item label="个人简介" prop="intro">
              <el-input v-model="infoForm.intro" />
            </el-form-item>
            <el-form-item label="个人网站" prop="website">
              <el-input v-model="infoForm.website" />
            </el-form-item>
            <el-button type="primary" @click="updateProfile" v-loading="infoLoading">修改</el-button>
          </el-form>
        </div>
      </el-tab-pane>

      <el-tab-pane label="修改密码" class="crad-two">
        <el-form label-position="left" label-width=" 100px" :model="passwordForm" ref="passwordFormRef"
          :rules="passwordFormRules" class="passwordForm">
          <el-form-item label="旧密码" prop="old_password">
            <el-input type="password" v-model="passwordForm.old_password" show-password placeholder="请输入旧密码" />
          </el-form-item>
          <el-form-item label="新密码" prop="new_password">
            <el-input type="password" v-model="passwordForm.new_password" :disabled="!passwordForm.old_password"
              show-password placeholder="请输入新密码" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm_password">
            <el-input type="password" v-model="passwordForm.confirm_password" :disabled="!passwordForm.new_password"
              show-password placeholder="请确认新密码" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updatePassword" v-loading=passwordLoading>
              提交
            </el-button>

          </el-form-item>
        </el-form></el-tab-pane>

    </el-tabs>
  </el-card>
</template>


<style lang="scss" scoped>
.profile-card {
  min-height: 650px;
  border-radius: 8px;

}

.tab {
  border: none;
}

.passwordForm {
  padding: 30px;
  width: 400px;
}

.card-first {
  display: flex;
  align-items: flex-start;
  /* 顶部对齐 */
  gap: 40px;
  /* 头像和表单之间留 40px 空隙 */
  padding: 80px;
}

.avatar-uploader {
  width: 140px;
  flex-shrink: 0;
  /* 🌟 防止被右侧的表单挤压变形 */
}

.avatar-uploader .avatar {
  width: 140px;
  height: 140px;
  display: block;
  object-fit: cover;
}

.avatar-uploader:deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

:deep(.el-icon.avatar-uploader-icon) {
  font-size: 28px;
  color: #8c939d;
  width: 140px;
  height: 140px;
  text-align: center;
}

.info-form {
  width: 400px;
}
</style>