<script setup>
import { useFullscreen } from '@vueuse/core'
import { FullScreen, Aim } from '@element-plus/icons-vue'

const { isFullscreen, toggle } = useFullscreen()
</script>
<template>
  <el-icon class="fullscreen-btn" :size="18" @click="toggle">
    <!-- 如果处于全屏，显示 Aim（类似退出全屏），否则显示 FullScreen -->
    <Aim v-if="isFullscreen" />
    <FullScreen v-else />
  </el-icon>

</template>


<style lang="scss" scoped>
.fullscreen-btn {
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.fullscreen-btn:hover {
  color: var(--el-color-primary);
}
</style>


<!-- <script setup>
import { ref } from 'vue'
import { FullScreen } from '@element-plus/icons-vue'

const isFullscreen = ref(false)

function toggle() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}
</script>

<template>
  <el-icon class="fullscreen-btn" size="18" @click="toggle">
    <FullScreen />
  </el-icon>
</template> -->