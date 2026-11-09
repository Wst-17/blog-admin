<script setup>
import { Refresh, Search, Check, Delete, CircleClose, CircleCheck } from '@element-plus/icons-vue';
import api from '@/api';
import { formatDate } from '@/utils';
import { onMounted, ref } from 'vue';
import { close } from 'element-plus/es/components/notification/src/notify.mjs';
import { all } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

// --数据--
const loading = ref(false)
const tableData = ref([])
const selections = ref([])
const total = ref()
const activeTab = ref(all)
const queryItems = ref({
    nickname: '',
    page_num: 1,
    page_size: 5
})
const extraParams = ref({
    is_review: null, // 评论状态: null-全部, true-通过, false-审核中
})

onMounted(() => fetchList())
// --获取列表--
async function fetchList() {
    loading.value = true
    try {
        const res = await api.getMessages({
            ...queryItems.value,
            ...extraParams.value
        })
        tableData.value = res.data.page_data
        total.value = res.data.total
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}
// --多选--
function handleSelectionChange(rows) {
    selections.value = rows
}
// --切换标签--
function handleChangeTab(value) {
    switch (value) {
        case 'all':
            extraParams.value.is_review = null
            break
        case 'has_review':
            extraParams.value.is_review = true
            break
        case 'not_review':
            extraParams.value.is_review = false
            break
    }
    queryItems.value.page_num = 1
    fetchList()
}
// --搜索--
function handleSearch() {
    queryItems.value.page_num = 1
    fetchList()
}
// --重置--
function handleReset() {
    queryItems.value.nickname = ''
    fetchList()
}
// --审核状态--
async function handleUpdateReview(ids, is_review) {
    if (!ids.length) {
        ElMessage.warning('请选择要审核的数据')
        return
    }
    try {
        await api.updateMessageReview(ids, is_review)
        ElMessage.success(is_review ? '审核通过成功' : '已撤下留言')
        fetchList()
    } catch (err) {
        console.error(err)
    }
}
// --删除--
async function handleDelete(rows) {
    if (!rows.length) return
    try {
        await ElMessageBox.confirm(`确定删除选择的${ids.length}数据吗？`, '提示', { type: 'warning' })
        const ids = rows.map(row => row.id)
        await api.deleteMessages(ids)
        ElMessage.success('删除成功')
        fetchList()
    } catch (err) {
        if (err !== 'cancel') close.error(err)
    }
}
</script>
<template>
    <div class="header">
        <h2>留言管理</h2>
        <div class="button">
            <el-button type="danger" :disabled="!selections.length" @click="handleDelete(selections)">批量删除</el-button>
            <el-button type="primary" :disabled="!selections.length"
                @click="handleUpdateReview(selections.map(s => s.id), true)">批量通过</el-button>
        </div>
    </div>
    <el-card calss="card">
        <!-- 标签栏 -->
        <el-tabs v-model="activeTab" @tab-change="handleChangeTab">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="通过" name="has_review" />
            <el-tab-pane label="审核中" name="not_review" />
        </el-tabs>
        <!-- 搜索栏 -->
        <el-form :model="queryItems">
            <div class="form-search">
                <el-form-item label="用户" style="margin-bottom: 0;" prop="name">
                    <el-input placeholder="请输入用户昵称" style="width: 160px; " v-model="queryItems.name"
                        @keyup.enter="handleSearch"></el-input>
                </el-form-item>
                <div class="form-button">
                    <el-button class="button1" :icon="Refresh" @click="handleReset">重置</el-button>
                    <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
                </div>
            </div>
        </el-form>
        <!-- 表格 -->
        <el-table border :data="tableData" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="头像" width="100" align="center">
                <template #default="{ row }">
                    <el-image :src="row.avatar" style="width: 40px; height: 40px; border-radius: 4px;">
                        {{ row.avatar }}
                    </el-image>
                </template>
            </el-table-column>
            <el-table-column label="留言人" width="120" align="center">
                <template #default="{ row }">
                    {{ row.nickname || '未知' }}
                </template>
            </el-table-column>
            <el-table-column label="留言内容" width="200" align="center">
                <template #default="{ row }">
                    {{ row.content || '未知' }}
                </template>
            </el-table-column>
            <el-table-column label="IP地址" width="120" align="center">
                <template #default="{ row }">
                    {{ row.ip_address || '未知' }}
                </template>
            </el-table-column>
            <el-table-column label="IP来源" width="120" align="center">
                <template #default="{ row }">
                    {{ row.ip_source || '未知' }}
                </template>
            </el-table-column>
            <el-table-column label="留言时间" width="150" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.created_at) }}
                </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.is_review ? 'success' : 'danger'" size="small">
                        {{ row.is_review ? '通过' : '审核中' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
                <template #default="{ row }">
                    <el-button type="warning" :icon="CircleClose" v-if="row.is_review" size="small"
                        @click="handleUpdateReview([row.id], false)">撤下</el-button>
                    <el-button type="success" :icon="CircleCheck" v-else size="small "
                        @click="handleUpdateReview([row.id], true)">通过</el-button>
                    <el-button type="danger" :icon="Delete" size="small" @click="handleDelete([row])">删除</el-button>
                </template>
            </el-table-column>

        </el-table>
        <!-- 分页 -->
        <el-pagination></el-pagination>
    </el-card>
</template>


<style lang="scss" scoped>
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px
}

.card {
    border-radius: 8px;
    min-height: 580px;
}

.form-search {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f7f8fa;
    border: 1px solid #7e7f7f;
    padding: 18px;
    border-radius: 8px;
    margin-bottom: 30px;

}

.button1 {
    background-color: #fff;
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
}
</style>