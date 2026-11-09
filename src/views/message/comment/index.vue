<script setup>
import api from '@/api';
import { Refresh, Search, Close, Check } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue';
import { formatDate } from '@/utils';
import { commentTypeOptions, commentTypeMap } from '@/assets/config';
import { ElMessage, ElMessageBox } from 'element-plus';
// --数据--
const loading = ref(false)
const total = ref()
const tableData = ref([])
const selections = ref([])
const queryItems = ref({
    nickname: '',
    type: null, // 来源
    page_num: 1,
    page_size: 10,
})

const extraParams = ref({
    is_review: null, // 评论状态: null-全部, true-通过, false-审核中
})

onMounted(() => handleChangeTab())

// --获取列表--
async function fetchList() {
    loading.value = true
    try {
        const res = await api.getComments({
            ...queryItems.value,
            ...extraParams.value,
        })
        tableData.value = res.data.page_data
        total.value = res.data.total
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}
// ================= 切换标签页 =================
function handleChangeTab(value) {
    switch (value) {
        case 'all':
            extraParams.value.is_review = null
            break
        case 'has_review': // 通过
            extraParams.value.is_review = true
            break
        case 'not_review': // 审核中
            extraParams.value.is_review = false
            break
    }
    queryItems.value.page_num = 1
    fetchList()
}
// --多选--
function handleSelectionChange(rows) {
    selections.value = rows
}
// ---搜索---
function handleSearch() {
    queryItems.value.page_num = 1
    fetchList()
}
// --重置--
function handleReset() {
    queryItems.value.nickname = ''
    queryItems.value.type = ''
    fetchList()
}
// --修改审核状态---
async function handleUpdateReview(ids, is_review) {
    if (!ids.length) {
        ElMessage.warning('请选择要审核的数据');
        return
    }
    try {
        await api.updateCommentReview(ids, is_review)
        ElMessage.success(is_review ? '审核通过成功' : '已撤下评论')
        fetchList()
    } catch (err) {
        console.error(err)
    }
}
// --删除--
async function handleDelete(rows) {
    if (!rows.length) return
    try {
        await ElMessageBox.confirm(`确定删除选中的 ${rows.length} 条评论吗？`, '提示', { type: 'warning' })
        const ids = rows.map(row => row.id)
        await api.deleteComments(ids)
        ElMessage.success('删除成功')
        fetchList()
    } catch (err) {
        if (err !== 'cancel') console.error(err)
    }
}
</script>
<template>
    <div class="header">
        <h2>评论管理</h2>
        <div class="button">
            <el-button type="danger" :disabled="!selections.length" @click="handleDelete(selections)">批量删除</el-button>
            <el-button type="primary" :disabled="!selections.length"
                @click="handleUpdateReview(selections.map(s => s.id), true)">批量通过</el-button>
        </div>
    </div>
    <el-card class="card">
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" @tab-change="handleChangeTab" style="margin-bottom: 20px;">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="通过" name="has_review" />
            <el-tab-pane label="审核中" name="not_review" />
        </el-tabs>
        <el-form :model="queryItems">
            <div class="form-search">
                <el-form-item label="用户" prop="nickname">
                    <el-input placeholder="请输入用户昵称" style="width: 200px" v-model="queryItems.nickname"></el-input>
                </el-form-item>
                <el-form-item label="来源" prop="type">
                    <el-select v-model="queryItems.type" placeholder="请选择评论来源" clearable style="width: 160px;">
                        <el-option v-for="item in commentTypeOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <div class="search-button">
                    <el-button class="button1" :icon="Refresh" @click="handleReset">重置</el-button>
                    <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
                </div>
            </div>
        </el-form>
        <el-table border :data="tableData" @selection-change="handleSelectionChange(row)">
            <el-table-column label="头像" width="120" align="center">
                <template #default="{ row }">
                    <el-image src="row?.avatar" style="width: 40px; height: 40px; border-radius: 4px;"></el-image>
                </template>
            </el-table-column>
            <el-table-column label="评论人" width="120" align="center" show-overflow-tooltip>
                <template #default="{ row }">{{ row.user?.info?.nickname || '无' }}</template>
            </el-table-column>

            <el-table-column label="回复对象" width="120" align="center" show-overflow-tooltip>
                <template #default="{ row }">{{ row.reply_user?.info?.nickname || '-' }}</template>
            </el-table-column>
            <el-table-column label="评论内容" width="300" align="center">
                <template #default="{ row }">{{ row.content }}</template>
            </el-table-column>
            <el-table-column label="评论时间" width="150" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.created_at) }}
                </template>
            </el-table-column>
            <el-table-column label="状态" width="120" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.is_review ? 'success' : 'danger'" size="small">
                        {{ row.is_review ? '通过' : '审核中' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="来源" width="120" align="center">
                <template #default="{ row }">
                    <el-tag :type="commentTypeMap[row.type]?.tag ?? 'default'" size="small" effect="plain">
                        {{ commentTypeMap[row.type]?.name ?? '未知' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
                <template #default="{ row }">
                    <el-button v-if="row.is_review" size="small" type="warning" :icon="Close"
                        @click="handleUpdateReview([row.id], false)">
                        撤下
                    </el-button>
                    <el-button v-else size="small" type="success" :icon="Check"
                        @click="handleUpdateReview([row.id], true)">
                        通过
                    </el-button>
                    <el-button size="small" type="danger" :icon="Delete" @click="handleDelete([row])">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination :total="1" layout="total , prev, pager, next, sizes" background
            style="margin-top: 10px; justify-content: flex-end;" />
    </el-card>
</template>


<style lang="scss" scoped>
.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px
}

.button1 {
    background-color: #fff;
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
}

.card {
    border-radius: 8px;
    min-height: 580px;
}

.form-search {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f7f8fa;
    border: 1px solid #7e7f7f;
    padding: 18px;
    border-radius: 8px;
    margin-bottom: 30px;
}

:deep(.el-form-item) {
    margin-bottom: 0;
}
</style>