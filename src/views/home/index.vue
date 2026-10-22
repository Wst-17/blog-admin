<script setup>
import { UserFilled } from '@element-plus/icons-vue';
</script>

<template>
    <el-card>
        <div class="wrapper">
            <!-- 问候 -->
            <!-- 头像 -->
            <el-avatar :size="60" :icon="UserFilled" />
            <!-- 用户名 -->
            <div class="info">
                <p class="hello"> Hello,name </p>
                <!-- 3. 替换为原生 CSS 渐变文字 -->
                <p class="sentence">
                    乾坤未定，你我既是黑马
                </p>
                <!-- </div> -->

            </div>
        </div>


    </el-card>
</template>

<style scoped>
.wrapper {
    display: flex;
    align-items: center;
}

.info {
    margin-left: 18px;

}

.hello {
    font-size: 15px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin: 0 0 8px 0;
}

/* 🌟 核心：纯 CSS 还原渐变色文字 */
.sentence {
    margin: 0;
    font-size: 14px;
    /* 渐变色背景 */
    opacity: 0.6;
    /* 设置一个横向的渐变背景 */
    background: linear-gradient(90deg, red 0%, green 50%, blue 100%);
    /* 裁剪背景到文字 */
    -webkit-background-clip: text;
    /* 背景会被裁剪，只剩下文字笔画覆盖的那部分背景 */
    background-clip: text;
    /* 文字变透明，透出背景 */
    -webkit-text-fill-color: transparent;
    color: transparent;
}
</style>
