<script setup>
import { Delete, EditPen, Plus } from '@element-plus/icons-vue';
import { onMounted, ref } from 'vue'
import api from '@/api'
import { formatDate } from '@/utils';
import { status } from 'nprogress';
import { ElMessage, ElMessageBox } from 'element-plus';

// --表格数据--
const tableData = ref([])
const loading = ref(false)
const selections = ref([])
const queryItems = ref({
    page_num: 1,
    page_size: 10
})
const total = ref()
const extraParams = ref({ status: 0 })

// --弹框数据--
const dialogVisible = ref(false)
const diaLoading = ref(false)
const dialogTitle = ref()
const formRef = ref()
const formData = ref({
    id: null,
    content: '',
    status: 1,
    is_top: false,
})
const rules = {
    content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}
onMounted(() => fetchList())
// 获取元素
async function fetchList() {
    loading.value = true
    try {
        const res = await api.getTalks({
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
// --新增--
function handleAdd() {
    dialogVisible.value = true
    dialogTitle.value = "新增说说"
    formData.value = {
        id: null,
        content: '',
        status: 1,
        is_top: false,
    }
}
// --编辑--
function handleEdit(row) {
    dialogVisible.value = true
    dialogTitle.value = '编辑说说'
    formData.value = { ...row }
}
// --多选--
function handleSelectionChange(rows) {
    selections.value = rows
}
// --删除--
async function handleDelete(rows) {
    if (!rows.length) return
    try {
        await ElMessageBox.confirm(`确定删除${rows.length}个说说吗`, '提示', { type: 'warning' })
        const ids = rows.map(row => row.id)
        await api.deleteTalks(ids)
        ElMessage.success('删除成功')
        fetchList()
    } catch (err) {
        if (err !== 'cancel')
            console.error(err)
    }
}
// --保存--
async function handleSave() {
    if (!formRef) return
    await formRef.value.validate(async (valid) => {
        if (!valid) return
        diaLoading.value = true
        try {
            await api.saveOrUpdateTalk(formData.value)
            ElMessage.success(formData.value.id ? '创建成功' : '修改成功')
            dialogVisible.value = false
            fetchList()
        } catch (err) {
            console.error(err)
        } finally {
            diaLoading.value = false
        }
    })
}
// --状态标签切换--
function handleChangeTab(status) {
    extraParams.value.status = Number(status)
    queryItems.value.page_num = 1
    fetchList()
}
</script>
<template>
    <div class="heard">
        <h2>说说管理</h2>
        <div>
            <el-button type="primary" :icon="Plus" @click="handleAdd">新增说说 </el-button>
            <el-button type="danger" plain :icon="Delete" :disabled="!selections.length"
                @click="handleDelete(selections)">批量删除</el-button>
        </div>
    </div>
    <el-card class="talk-card">
        <!-- 状态标签页 -->
        <el-tabs style="margin-bottom: 20px;" v-model="extraParams.status" @tab-change="handleChangeTab">
            <el-tab-pane label="全部" name="0" />
            <el-tab-pane label="公开" name="1" />
            <el-tab-pane label="私密" name="2" />
        </el-tabs>
        <el-table border :data="tableData" v-loading="loading" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="内容" prop="content" width="630" align="center"></el-table-column>
            <el-table-column label="发布者" width="80" align="center">
                <template #default="{ row }">{{ row.user?.info?.nickname || '-' }}</template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
                        {{ row.status === 1 ? '公开' : '私密' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="置顶" width="60" align="center">
                <template #default="{ row }">
                    <el-tag :type="row.is_top ? 'info' : 'info'" size="small" effect="plain">
                        {{ row.is_top ? '是' : '否' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="发布时间" width="100" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.created_at) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                    <div class="table-button">
                        <el-button type="primary" :icon="EditPen" size="small" style=" margin: 0;"
                            @click="handleEdit(row)">编辑</el-button>
                        <el-button type="danger" plain :icon="Delete" size="small" style=" margin: 0;"
                            @click="handleDelete([row])">删除</el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination v-model:current-page="queryItems.page_num" v-model:current-size="queryItems.page_size"
            :total='total' :page-sizes="[5, 10, 15]" background layout="total,prev,pager,next,sizes"
            style="margin-top: 20px; justify-content: flex-end;" />
    </el-card>
    <!-- 弹框 -->
    <el-dialog v-model="dialogVisible" align-center="ture" :title="dialogTitle" style="width: 520px;">
        <el-form ref="formRef" :model="formData" :rules="rules">
            <el-form-item label="新增说说" prop="content">
                <el-input v-model="formData.content" maxlength="1000" style="width: 340px " placeholder="说点什么..."
                    show-word-limit type="textarea" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-radio-group v-model="formData.status">
                    <el-radio value="1">公开</el-radio>
                    <el-radio value="2">私密</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="置顶" prop="is_top">
                <el-radio-group v-model="formData.is_top">
                    <el-radio value="false">不置顶</el-radio>
                    <el-radio value="ture">置顶</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSave">确定</el-button>
            </el-form-item>
        </el-form>
    </el-dialog>
</template>


<style lang="scss" scoped>
.heard {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
}

.talk-card {
    min-height: 580px;
    border-radius: 8px;
}

.table-button {
    display: flex;
    align-items: center;
    /* 🌟 重点！让元素垂直排列 */
    flex-direction: column;
    gap: 8px;

}
</style>