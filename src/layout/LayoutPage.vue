<script setup>
import Appheader from '@/layout/header/index.vue'


</script>

<template>
    <div class="common-layout">
        <el-container>
            <el-aside width="200px">Aside</el-aside>
            <el-container>
                <el-header>
                    <Appheader></Appheader>
                </el-header>
                <el-main>
                    <RouterView></RouterView>
                </el-main>
            </el-container>
        </el-container>
    </div>

</template>