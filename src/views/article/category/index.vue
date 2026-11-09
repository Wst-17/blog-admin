<script setup>
import { Plus, Download, Delete, Search, Refresh, EditPen } from '@element-plus/icons-vue';
import api from '@/api'
import { ElMessageBox, ElMessage } from 'element-plus'
import { ref, onMounted } from 'vue'
import { formatDate } from '@/utils'

// KeepAlive 需要 name
defineOptions({ name: 'CategoryList' })
// ---数据状态---
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const selections = ref([])
const queryItems = ref({
    keyword: '',
    page_num: 1,
    page_size: 10
})

// ---弹窗状态---
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogLoading = ref(false)
const formData = ref({
    id: null,
    name: ''
})
const formRef = ref(null)
const rules = {
    name: [{ required: true, message: '请输入分类名称', trigger: ['blur', 'change'] }]
}

onMounted(() => fetchList()
)

// ---获取列表--
async function fetchList() {
    loading.value = true
    try {
        const res = await api.getCategorys(queryItems.value)
        tableData.value = res.data.page_data
        total.value = res.data.total
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

// ---搜索---
function handleSearch() {
    queryItems.value.page_num = 1
    fetchList()
}
// --多选---
function handleSelectionChange(rows) {
    selections.value = rows
}
// ---重置---
function handleReset() {
    queryItems.value.keyword = '';
    handleSearch()
}

// --- 新建  ---
function handleAdd() {
    dialogVisible.value = true
    dialogTitle.value = '新建分类'
    formData.value = { id: null, name: '' }

}
// ---编辑----
function handleEdit(row) {
    dialogTitle.value = '编辑分类'
    formData.value = { ...row }
    dialogVisible.value = true
}
// 
async function handleSave() {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
        if (!valid) return
        dialogLoading.value = true
        try {
            await api.saveOrUpdateCategory(formData.value)
            ElMessage.success(formData.value.id ? '修改成功' : '创建成功')
            dialogVisible.value = false
            fetchList()
        } catch (err) {
            console.error(err)
        } finally {
            dialogLoading.value = false
        }
    })
}

// --- 删除 ---
async function handleDelete(rows) {
    if (!rows.length) return
    try {
        await ElMessageBox.confirm(`确定删除选中的 ${rows.length} 个分类吗？`, '提示', { type: 'warning' })
        const ids = rows.map(row => row.id)
        await api.deleteCategory(ids)
        ElMessage.success('删除成功')
        fetchList()
    } catch (err) {
        if (err !== 'cancel') console.error(err)
    }
}
</script>
<template>
    <div class="heard">
        <h2>分类管理</h2>
        <div class="heard-button">
            <el-button plain :icon="Download">
                导出
            </el-button>
            <el-button type="primary" :icon="Plus" @click="handleAdd">
                新建分类
            </el-button>
            <el-button type="danger" :icon="Delete" :disabled="!selections.length" @click="handleDelete(selections)">
                批量删除
            </el-button>
        </div>
    </div>
    <el-card class="card">
        <el-form>
            <div class="card-form">
                <el-form-item label="分类名" label-width="60">
                    <el-input v-model="queryItems.keyword" placeholder="请输入分类名" @keyup.enter="handleSearch" />
                </el-form-item>
                <!-- 按钮 -->
                <div class="card-button">
                    <el-button class="button1" :icon="Refresh" @click="handleReset">重置</el-button>
                    <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
                </div>
            </div>
        </el-form>
        <!-- 表格 -->
        <el-table :data="tableData" style="width: 100%" border @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="分类名" prop="name" width="200" align="center" />
            <el-table-column label="文章量" prop="article_count" width="80" align="center" />
            <el-table-column label="创建日期" width="200" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.created_at) }}
                </template>
            </el-table-column>
            <el-table-column prop="updated_at" width="200" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.updated_at) }}
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" min-width="200" align="center">
                <template #default="{ row }">
                    <el-button type="primary" size="small" :icon="EditPen" @click="handleEdit(row)">
                        编辑
                    </el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="handleDelete([row])">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination v-model:current-page="queryItems.page_num" v-model:page-size="queryItems.page_size"
            :page-sizes="[5, 10, 15]" :total="total" layout=" total, prev, pager, next ,sizes" @size-change="fetchList"
            @current-change="fetchList" style="margin-top: 20px; justify-content: flex-end;" background />
    </el-card>

    <!-- 弹框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500" destroy-on-close>
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
            <el-form-item label="文章分类" prop="name">
                <el-input placeholder="请输入分类名称" v-model="formData.name" clearable></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSave" :loading="dialogLoading">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>


<style lang="scss" scoped>
.heard {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
}

.card {
    min-height: 600px;
    border-radius: 10px;
}

/* 卡片头部搜索框容器 */
.card-form {
    display: flex;
    background-color: #f7f8fa;
    border: 1px solid #7e7f7f;
    border-radius: 8px;
    justify-content: space-between;
    align-items: center;
    padding: 18px;
    margin-bottom: 30px;

}

:deep(.el-form-item__label) {
    font-weight: 500;
}

.button1 {
    background-color: #fff;
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);
}

/* 干掉 el-form-item 的默认坑 */
:deep(.el-form-item) {
    /* 干掉默认的底部间距，这是偏上的元凶 */
    margin-bottom: 0 !important;
}
</style>