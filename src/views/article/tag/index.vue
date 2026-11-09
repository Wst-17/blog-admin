<script setup>
import { Delete, EditPen, Plus, Refresh, Search } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue'
import api from '@/api'
import { formatDate } from '@/utils'
import { ElMessageBox, ElMessage } from 'element-plus';
import { valid } from 'mockjs';

// --数据状态--
const tableData = ref([])
const total = ref()
const selections = ref([])
const loading = ref(false)
const queryItems = ref({
    name: '',
    page_num: 1,
    page_size: 10
})
// 弹框信息
const dialogFormVisible = ref(false)
const dialogTitle = ref()
const dialogLoading = ref(false)
const formData = ref({
    id: 'null',
    name: ''
})
const formRef = ref()
const rulse = {
    name: [{ required: true, message: '请输入标签名', trigger: 'blur' }]
}
onMounted(() => fetchList())

// 获取数据
async function fetchList() {
    loading.value = true
    try {
        const res = await api.getTags(queryItems.value)
        tableData.value = res.data.page_data
        total.value = res.data.total
    }
    catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }

}
// --新建标签--
function handleAdd() {
    dialogFormVisible.value = true
    dialogTitle.value = '新建标签'
    formData.value = { id: 'null', name: '' }
}
// --删除--
async function handleDelete(rows) {
    if (!rows.length) return
    try {
        await ElMessageBox.confirm(`确定删除的${rows.length}个标签`, '提示', { type: 'warning' })
        const ids = rows.map(row => row.id)
        await api.deleteTag(ids)
        ElMessage.success('删除成功')
        fetchList()
    } catch (err) {
        if (err !== 'cancel')
            console.error(err)
    }
}
// -- 多选择--
function handleSelectionChange(rows) {
    selections.value = rows
}
// --搜索--
function handleSearch() {
    queryItems.value.page_num = 1
    fetchList()
}
// --重置--
function handleReset() {
    queryItems.value.name = ''
    fetchList()
}
// --编写--
function handleEdit(row) {
    dialogFormVisible.value = true
    dialogTitle.value = '编写标签'
    formData.value = { ...row }
}
// 弹框确定
async function handleSave() {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
        if (!valid) return
        dialogLoading.value = true
        try {
            await api.saveOrUpdateTag(formData.value)
            ElMessage.success(formData.value.id ? '创建成功' : '修改成功')
            dialogFormVisible.value = false
            fetchList()
        } catch (err) {
            console.error(err)
        } finally {
            dialogLoading.value = false
        }
    })
}
</script>
<template>
    <div class="heard">
        <h2>标签管理</h2>
        <div class="heard-button">
            <el-button type="primary" :icon="Plus" @click="handleAdd">新建标签</el-button>
            <el-button type="danger" plain :icon="Delete" :disabled="!selections.length"
                @click="handleDelete(selections)">批量删除</el-button>
        </div>
    </div>
    <el-card class="card">
        <el-form class="card-form">
            <div class="form-search">
                <el-form-item label="标签名" label-width="70">
                    <el-input placeholder="请输入标签名" v-model="queryItems.name"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button :icon="Refresh" @click="handleReset">重置</el-button>
                    <el-button :icon="Search" type="primary" @click="handleSearch">搜索</el-button>
                </el-form-item>
            </div>
        </el-form>
        <!-- 表格 -->
        <el-table :data="tableData" border @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" label="标签名" width="240" align="center"></el-table-column>
            <el-table-column prop="article_count" label="文章量" width="100" align="center"></el-table-column>
            <el-table-column label="创建日期" width="240" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.created_at) }}
                </template>
            </el-table-column>
            <el-table-column label="更新日期" width="240" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.updated_at) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
                <template #default="{ row }">
                    <el-button type="primary" :icon="EditPen" @click="handleEdit(row)">编写</el-button>
                    <el-button type="danger" :icon="Delete" @click="handleDelete([row])">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination v-model:current-page="queryItems.page_num" v-model:page-size="queryItems.page_size"
            :page-sizes="[5, 10, 15]" background :total="total" layout="total, prev, pager, next ,sizes"
            style="margin-top: 20px; justify-content: flex-end;" />

    </el-card>
    <!-- 弹框 -->
    <el-dialog v-model="dialogFormVisible" :title="dialogTitle" width="500" ref="formRef">
        <el-form :rules="rulse" :model="formData" ref="formRef">
            <el-form-item label="文章标签" prop="name">
                <el-input placeholder="请输入标签名" v-model="formData.name"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="footer-button">
                <el-button @click="dialogFormVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSave">确定</el-button>
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
    border-radius: 8px;
    min-height: 580px;
}

.card-form {
    background-color: #f7f8fa;
    border: 1px solid #7e7f7f;
    border-radius: 8px;
    margin-bottom: 20px;

}

.form-search {
    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 18px 10px;

}

.form-search:deep(.el-input) {
    width: 200px;
}

:deep(.el-form-item) {
    margin-bottom: 0;
}

:deep(.el-form-item__label) {
    font-weight: 500;
}
</style>