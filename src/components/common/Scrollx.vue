<!-- 当顶部标签栏（Tags View）的标签太多、超出了屏幕宽度时，支持鼠标滚轮横向滚动，并在左右两侧显示箭头 -->
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

defineProps({
    showArrow: {
        type: Boolean,
        default: true,
    },
})

const translateX = ref(0)
const content = ref(null)
const wrapper = ref(null)
const isOverflow = ref(false)

const resetTranslateX = debounce((wrapperWidth, contentWidth) => {
    if (!isOverflow.value)
        translateX.value = 0
    else if (-translateX.value > contentWidth - wrapperWidth)
        translateX.value = wrapperWidth - contentWidth
    else if (translateX.value > 0)
        translateX.value = 0
}, 200)

const refreshIsOverflow = debounce(() => {
    const wrapperWidth = wrapper.value?.offsetWidth
    const contentWidth = content.value?.offsetWidth
    isOverflow.value = contentWidth > wrapperWidth
    resetTranslateX(wrapperWidth, contentWidth)
}, 200)

function handleMouseWheel(e) {
    // 兼容性处理：用 deltaY 替代废弃的 wheelDelta
    const wheelDelta = -e.deltaY
    const wrapperWidth = wrapper.value?.offsetWidth
    const contentWidth = content.value?.offsetWidth

    if (wheelDelta < 0) {
        if (wrapperWidth > contentWidth && translateX.value < -10) return
        if (wrapperWidth <= contentWidth && contentWidth + translateX.value - wrapperWidth < -10) return
    }
    if (wheelDelta > 0 && translateX.value > 10) return

    translateX.value += wheelDelta
    resetTranslateX(wrapperWidth, contentWidth)
}

const observer = new MutationObserver(refreshIsOverflow)

onMounted(() => {
    refreshIsOverflow()
    window.addEventListener('resize', refreshIsOverflow)
    observer.observe(content.value, { childList: true })
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', refreshIsOverflow)
    observer.disconnect()
})

// 🌟 暴露给父组件：当激活的标签在屏幕外时，自动滑动过去
function handleScroll(x, width) {
    const wrapperWidth = wrapper.value?.offsetWidth
    const contentWidth = content.value?.offsetWidth
    if (contentWidth <= wrapperWidth) return

    // 当 x 小于可视范围的最小值时
    if (x < -translateX.value + 150) {
        translateX.value = -(x - 150)
        resetTranslateX(wrapperWidth, contentWidth)
    }

    // 当 x 大于可视范围的最大值时
    if (x + width > -translateX.value + wrapperWidth) {
        translateX.value = wrapperWidth - (x + width)
        resetTranslateX(wrapperWidth, contentWidth)
    }
}

// 防抖函数
function debounce(method, wait, immediate) {
    let timeout
    return function (...args) {
        const context = this
        if (timeout) clearTimeout(timeout)

        if (immediate) {
            const callNow = !timeout
            timeout = setTimeout(() => { timeout = null }, wait)
            if (callNow) method.apply(context, args)
        } else {
            timeout = setTimeout(() => { method.apply(context, args) }, wait)
        }
    }
}

defineExpose({ handleScroll })
</script>

<template>
    <div ref="wrapper" class="scroll-x-wrapper" @mousewheel.prevent="handleMouseWheel">
        <!-- 左侧箭头 -->
        <template v-if="showArrow && isOverflow">
            <div class="scroll-arrow left" @click="handleMouseWheel({ deltaY: -120 })">
                <el-icon>
                    <ArrowLeft />
                </el-icon>
            </div>
            <div class="scroll-arrow right" @click="handleMouseWheel({ deltaY: 120 })">
                <el-icon>
                    <ArrowRight />
                </el-icon>
            </div>
        </template>

        <!-- 滚动内容区域 -->
        <div ref="content" class="scroll-content" :class="{ 'is-overflow': isOverflow && showArrow }"
            :style="{ transform: `translateX(${translateX}px)` }">
            <slot />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.scroll-x-wrapper {
    display: flex;
    background-color: #fff;
    z-index: 9;
    overflow: hidden;
    position: relative;
    height: 100%;
    /* 撑满父容器高度 */
}

.scroll-content {
    padding: 0 10px;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    transition: transform 0.5s;

    &.is-overflow {
        padding-left: 30px;
        padding-right: 30px;
    }
}

.scroll-arrow {
    background-color: #fff;
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    width: 20px;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #606266;
    border: 1px solid #e0e0e6;
    border-radius: 2px;
    z-index: 2;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s;

    &:hover {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary-light-5);
        background-color: var(--el-color-primary-light-9);
    }

    &.left {
        left: 0;
    }

    &.right {
        right: 0;
    }
}

/* 暗黑模式适配 */
:global(html.dark) .scroll-x-wrapper {
    background-color: #1d1e1f;
}

:global(html.dark) .scroll-arrow {
    background-color: #1d1e1f;
    border-color: #363637;
    color: #cfd3dc;
}
</style>