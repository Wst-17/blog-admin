<script setup>
import api from '@/api'
import { formatDate } from '@/utils'
import { Delete, EditPen, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'

// --表单数据--
const loading = ref(false)
const tableData = ref([])
const selections = ref()
const queryItems = ref({
    name: '',
})

const clicked = ref(false)
function onCancel() {
    clicked.value = true
}

onMounted(() => fetchList())
// --获取列表--
async function fetchList() {
    loading.value = true
    try {
        const res = await api.getOnlineUsers(queryItems.value)
        tableData.value = res.data
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
// --搜索--
function handleSearch() {
    fetchList()
}
// --重置--
function handleReset() {
    queryItems.value.name = ''
}
// --线下--
async function handleUpdateDisable(row) {
    try {
        await ElMessageBox.confirm('确定强制该用户下线吗？', '提示', { typr: 'warning' })
        await api.forceOfflineUser(row.id)
        ElMessage.success('该用户已被强制下线')
        fetchList()
    } catch (err) {
        if (err !== 'cancel') {
            console.error(err)
        }
    }
}
</script>
<template>
    <h2 class="header">在线用户</h2>
    <el-card class="card">
        <el-form label-width="100" label-position="right" :model="queryItems">
            <div class="form-search">
                <el-form-item label="昵称|用户名" prop="name">
                    <el-input placeholder="搜索关键字" v-model="queryItems.name"></el-input>
                </el-form-item>
                <div class="form-button">
                    <el-button class="button1" :icon="Refresh" @click="handleReset">
                        重置</el-button>
                    <el-button :icon="Search" type="primary" @click="handleSearch">搜索</el-button>
                </div>
            </div>
        </el-form>
        <el-table border :data="tableData" @selection-change="handleSelectionChange" v-loading="loading">
            <el-table-column type="selection" width="55" />
            <el-table-column label="头像" width="80" align="center">
                <template #default="{ row }">
                    <el-image :src="row.info?.avatar" style="width: 40px; height: 40px; border-radius: 4px;" />
                </template>
            </el-table-column>
            <el-table-column label="昵称" width="120" align="center">
                <template #default="{ row }">{{ row.info?.nickname || '-' }}</template>
            </el-table-column>
            <el-table-column label="登录IP" width="150" align="center">
                <template #default="{ row }">
                    {{ row.ip_adderss || '未知' }}
                </template>
            </el-table-column>
            <el-table-column label="登录地址" width="150" align="center">
                <template #default="{ row }">
                    {{ row.ip_source || '未知' }}
                </template>
            </el-table-column>
            <el-table-column label="操作系统" width="150" align="center">
                <template #default="{ row }">
                    {{ row.os || '未知' }}
                </template>
            </el-table-column>
            <el-table-column label="登录浏览器" width="150" align="center">
                <template #default="{ row }">
                    {{ row.browser || '未知' }}
                </template>
            </el-table-column>
            <el-table-column label="登录时间" width="160" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.created_at) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                    <el-button type="warning" :icon="Delete" @click="handleUpdateDisable(row)">下线</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>
</template>


<style lang="scss" scoped>
.header {
    padding: 16px 20px;
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

.card {
    border-radius: 8px;
    min-height: 580px;
}

.button1 {

    background-color: #fff;
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);

}

:deep(.el-input) {
    --el-input-width: 200px
}

:deep(.el-form-item) {
    /* 干掉默认的底部间距，这是偏上的元凶 */
    margin-bottom: 0 !important;
}
</style>