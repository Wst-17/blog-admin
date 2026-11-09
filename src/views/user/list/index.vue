<script setup>
import api from '@/api'
import { formatDate } from '@/utils'
import { EditPen, Refresh, Search } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
//  --表格数据--
const tableData = ref([])
const loading = ref(false)
const selections = ref([])
const total = ref(0)
const queryItems = ref({
    username: '',
    nickname: '',
    login_type: '',
    page_num: 1,
    page_size: 5
})
// --弹窗数据--
const dialogLoading = ref(false)
const dialogVisible = ref(false)
const formRef = ref()
const formData = ref({
    id: '',
    username: '',
    role_ids: [],
})
const rules = {
    nickname: [{ required: true, message: '请输入用户昵称', trigger: ['blur', 'change'] }],
}
// 角色选项
const roleOptions = ref([])

onMounted(async () => {
    try {
        const res = await api.getRoleOption()
        roleOptions.value = res.data
    } catch (err) {
        console.error(err)
    }
    fetchList()
})
// --获取列表--
async function fetchList() {
    loading.value = true
    try {
        const res = await api.getUsers(queryItems.value)
        tableData.value = res.data.page_data
        total.value = res.data.total
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}
// ================= 搜索 / 重置 =================
function handleSearch() {
    queryItems.value.page_num = 1
    fetchList()
}

function handleReset() {
    queryItems.value.username = ''
    queryItems.value.nickname = ''
    queryItems.value.login_type = null
    handleSearch()
}

// ================= 多选 =================
function handleSelectionChange(rows) {
    selections.value = rows
}

// ================= 编辑 =================
function handleEdit(row) {
    formData.value = {
        id: row.id,
        nickname: row.info?.nickname || '',
        role_ids: row.roles?.map(r => r.id) ?? [],
    }
    dialogVisible.value = true
}

// ================= 保存 =================
async function handleSave() {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
        if (!valid) return
        dialogLoading.value = true
        try {
            await api.updateUser(formData.value)
            ElMessage.success('修改成功')
            dialogVisible.value = false
            fetchList()
        } catch (err) {
            console.error(err)
        } finally {
            dialogLoading.value = false
        }
    })
}

// ================= 修改禁用状态 =================
async function handleUpdateDisable(row) {
    if (!row.id) return
    const oldVal = row.is_disable
    row.is_disable = !row.is_disable
    try {
        await api.updateUserDisable(row.id, row.is_disable)
        ElMessage.success(row.is_disable ? '已禁用该用户' : '已取消禁用该用户')
        fetchList()
    } catch (err) {
        row.is_disable = oldVal
        console.error(err)
    }
}
</script>
<template>
    <h2 class="header">用户列表</h2>
    <el-card class="card">
        <el-form label-width="70" label-position="right" :model="queryItems">
            <div class="form-search">
                <el-form-item label="昵称" prop="username">
                    <el-input placeholder="请输入昵称" v-model="queryItems.username"></el-input>
                </el-form-item>
                <el-form-item label="用户名" prop="nickname">
                    <el-input placeholder="请输入用户名" v-model="queryItems.nickname"></el-input>
                </el-form-item>
                <el-form-item label="登录方式" prop="login_type">
                    <el-input placeholder="请输入登录方式" v-model="queryItems.login_type"></el-input>
                </el-form-item>
                <div class="form-button">
                    <el-button class="button1" :icon="Refresh" @click="handleReset">
                        重置</el-button>
                    <el-button :icon="Search" type="primary" @click="handleSearch">搜索</el-button>
                </div>
            </div>
        </el-form>
        <el-table border :data="tableData" v-loading="loading" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column label="头像" width="80" align="center">
                <template #default="{ row }">
                    <el-image :src="row.info?.avatar" style="width: 40px; height: 40px; border-radius: 4px;"
                        fit="cover" />
                </template>
            </el-table-column>
            <el-table-column label="昵称" width="120" align="center">
                <template #default="{ row }">{{ row.info?.nickname || '-' }}</template>
            </el-table-column>

            <el-table-column label="登录方式" width="100" align="center">
                <template #default="{ row }">
                    <el-tag size="small" :type="row.login_type === 1 ? 'info' : 'success'">
                        {{ row.login_type === 1 ? '账号登录' : '未知' }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="用户角色" width="160" align="center">
                <template #default="{ row }">
                    <el-tag v-if="row.is_super" size="small" type="danger">超级管理员</el-tag>
                    <template v-else>
                        <el-tag v-for="role in row.roles" :key="role.id" type="info" size="small"
                            style="margin: 2px;">{{ role.name }}</el-tag>
                        <span v-if="!row.roles?.length">无</span>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="登录IP" width="150" align="center">
                <template #default="{ row }">
                    {{ row.ip_address || '未知' }}
                </template>
            </el-table-column>
            <el-table-column label="登录地址" width="150" align="center">
                <template #default="{ row }">
                    {{ row.ip_source }}
                </template>
            </el-table-column>
            <el-table-column label="创建时间" width="150" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.created_at) }}
                </template>
            </el-table-column>
            <el-table-column label="上次登录时间" width="160" align="center">
                <template #default="{ row }">
                    {{ formatDate(row.updated_at) }}
                </template>
            </el-table-column>
            <el-table-column label="禁用" width="80" align="center">
                <template #default="{ row }">
                    <el-switch :model-value="row.is_disable" @change="() => handleUpdateDisable(row)" />
                    <!--  -->
                </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                    <el-button type="primary" :icon="EditPen" @click="handleEdit(row)">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination v-model:current-page="queryItems.page_num" v-model:page-size="queryItems.page_size"
            :page-sizes="[5, 10, 15]" :total="total" layout="total, prev, pager, next, sizes" background
            @size-change="fetchList" @current-change="fetchList" style="margin-top: 20px; justify-content: flex-end;" />
    </el-card>
    <!-- 弹窗 -->
    < <el-dialog v-model="dialogVisible" title="修改用户" width="500px" destroy-on-close>
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
            <el-form-item label="用户昵称" prop="nickname">
                <el-input v-model="formData.nickname" placeholder="请输入用户昵称" clearable />
            </el-form-item>
            <el-form-item label="角色" prop="role_ids">
                <el-checkbox-group v-model="formData.role_ids">
                    <el-checkbox v-for="item in roleOptions" :key="item.value" :label="item.value">
                        {{ item.label }}
                    </el-checkbox>
                </el-checkbox-group>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="dialogLoading" @click="handleSave">确定</el-button>
            </span>
        </template>
        </el-dialog>
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