<script setup>
import { Edit, Plus, Refresh, Search, View, Delete } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { formatDate } from '@/utils'
import { onMounted, ref, onActivated } from 'vue'

const route = useRoute()
const router = useRouter()
const selections = ref([])
const categoryOptions = ref([])
const tagOptions = ref([])
const tableData = ref([])
const total = ref(0)
const loading = ref(false)
const activeTab = ref('all')

const queryItems = ref({
    title: '',
    type: null,
    category_id: null,
    tag_id: null,
    page_num: 1,
    page_size: 10
})
const extraParams = ref({
    is_delete: false, // 🌟 改成布尔值 false
    status: null,
})

onMounted(async () => {
    api.getCategoryOption().then(res => (categoryOptions.value = res.data)).catch(err => console.error(err))
    api.getTagOption().then(res => (tagOptions.value = res.data)).catch(err => console.error(err))
    handleChangeTab('all')
})

onActivated(() => {
    if (route.query.needRefresh) fetchList()
})

// 查询
async function fetchList() {
    loading.value = true
    try {
        const res = await api.getArticles({
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
function handleChangeTab(tabName) {
    activeTab.value = tabName
    const tabMap = {
        all: { is_delete: 0, status: null },
        public: { is_delete: 0, status: 1 },
        secret: { is_delete: 0, status: 2 },
        draft: { is_delete: 0, status: 3 },
        delete: { is_delete: 1, status: null },
    }
    extraParams.value = tabMap[tabName]
    queryItems.value.page_num = 1
    fetchList()
}
// 重置键
function refresh() {
    queryItems.title = ''; queryItems.category_id = null; queryItems.tag_id = null; fetchList()
}
function beforeUpload(file) {
    // 获取用户上传的文件名，并将其全部转换为小写字母
    const name = file.name.toLowerCase()
    if (!name.endsWith('.md') && !name.endsWith('.markdown')) {
        ElMessage.error('只能上传 .md / .markdown 格式的文件！')
        return false
    }
    return true
}
// 上传文章成功后
function afterUpload(response) {
    if (response.code === 0) {
        fetchList()
        ElMessage.success('文章导入成功！')
    } else {
        ElMessage.error(response.message || '文章导入失败！')
    }
}
// 选择文章
function handleSelectionChange(rows) {
    selections.value = rows
}
// 删除文章
async function handleDelete(rows) {
    if (!rows.length) return
    try {
        await ElMessageBox.confirm(`确定删除选中的 ${rows.length} 篇文章吗？`, '提示', { type: 'warning' })
        const ids = rows.map(row => row.id)
        await api.softDeleteArticle(ids, true)
        ElMessage.success('删除成功')
        fetchList()
    } catch (err) {
        if (err !== 'cancel') console.error(err)
    }
}

// 修改文章置顶
async function handleUpdateTop(row, val) {

    const newVal = val ? 1 : 0
    const oldVal = row.is_top
    row.is_top = newVal
    console.log('即将传给接口的参数是 id:', row.id, ' is_top:', newVal)
    try {
        // 4. 调用接口
        await api.updateArticleTop(row.id, newVal)
        ElMessage.success(val ? '置顶成功' : '已取消置顶')

        // 5. 🌟 最核心：成功之后，重新请求一次列表！让数据和 Mock 保持绝对同步
        await fetchList()
    } catch (err) {
        // 6. 如果报错，把状态回滚
        row.is_top = oldVal
        console.error(err)
        ElMessage.error('修改失败')
    }
}
function exportArticles(rows) {
    if (!rows.length) return
    rows.forEach(item => {
        const blob = new Blob([item.content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${item.title}.md`
        a.click()
        URL.revokeObjectURL(url)
    })
    ElMessage.success('导出成功')
}
</script>
<template>
    <!-- 文章列表的头部 -->
    <div class="heard">
        <h2>文章列表</h2>
        <div class="hread-right">
            <el-button type="primary" :icon="Plus" @click="router.push('/article/write')">
                新建文章
            </el-button>
            <el-button type="danger" plain :icon="Refresh" :disabled="!selections.length"
                @click="handleDelete(selections)">
                批量删除
            </el-button>
            <el-button plain :icon="Edit" :disabled="!selections.length" @click="exportArticles(selections)">
                批量导出
            </el-button>
            <el-upload action="/api/article/import" :show-file-list="false" :before-upload="beforeUpload"
                :on-success="afterUpload" style="display: inline-block; margin-left: 12px;">
                <el-button :icon="Edit">
                    批量导入
                </el-button>
            </el-upload>
        </div>
    </div>
    <el-card class="card-contant">
        <template #header>状态</template>
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" type="card" @tab-change="handleChangeTab">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="公开" name="public" />
            <el-tab-pane label="私密" name="secret" />
            <el-tab-pane label="草稿箱" name="draft" />
            <el-tab-pane label="回收站" name="delete" />
        </el-tabs>
        <div class="search-wrapper">
            <el-form :model="queryItems" class="search-form" label-position="left" label-width="60px 
        ">
                <div class="search-left">
                    <el-form-item label="标题" prop="title">
                        <el-input placeholder="请输入标题" v-model="queryItems.title" />
                    </el-form-item>
                    <el-form-item label="类型" prop="type">
                        <el-select placeholder="请选择文章类型" clearable v-model="queryItems.type">
                            <el-option label="原创" :value="1" />
                            <el-option label="转载" :value="2" />
                            <el-option label="翻译" :value="3" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="分类" porp="category_id">
                        <el-select placeholder="请选择文章分类" v-model="queryItems.category_id" @keyup.enter="fetchList">
                            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label"
                                :value="item.value" />

                        </el-select>
                    </el-form-item>
                    <el-form-item label="标签 " prop="tag_id">
                        <el-select placeholder="请选择文章标签" v-model="queryItems.tag_id">
                            <el-option v-for="item in tagOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </div>
                <div class="search-button">
                    <el-form-item>
                        <el-button :icon="Refresh" @click="refresh">重置</el-button>
                        <el-button type="primary" :icon="Search" @click="fetchList">搜索</el-button>
                    </el-form-item>
                </div>
            </el-form>
        </div>
        <!-- 表格 -->
        <div class="tab">
            <el-table :data="tableData" v-loading="loading" border @selection-change="handleSelectionChange"
                style="margin-top: 20px;">
                <el-table-column type="selection" width="55" />
                <el-table-column label="文章封面" width="100" align="center">
                    <template #default="{ row }">
                        <el-image :src="row.img" style="width: 40px; height: 40px; border-radius: 4px;" fit="cover" />
                    </template>
                </el-table-column>
                <el-table-column label="文章标题" width="160" prop="title" align="center" />
                <el-table-column label="分类" width="100" align="center">
                    <template #default="{ row }">{{ row.category?.name || '无' }}</template>
                </el-table-column>
                <el-table-column label="标签" width="100" align="center">
                    <template #default="{ row }"> <el-tag v-for="tag in row.tags" :key="tag.id" size="small" type="info"
                            style="margin: 2px;">{{ tag.name }}</el-tag></template>
                </el-table-column>
                <el-table-column label="浏览" width="100" prop="view_count" align="center" />
                <el-table-column label="类型" width="100" align="center">
                    <template #default="{ row }">
                        <!-- 🌟 根据 type 的值，渲染不同颜色和文字 -->
                        <el-tag v-if="row.type === 1" type="success" size="small">
                            原创
                        </el-tag>
                        <el-tag v-else-if="row.type === 2" type="warning" size="small">
                            转载
                        </el-tag>
                        <el-tag v-else-if="row.type === 3" type="info" size="small">
                            翻译
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="发布时间" width="180" align="center">
                    <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
                </el-table-column>
                <el-table-column label="置顶" width="100" align="center">
                    <template #default="{ row }">
                        <el-switch :model-value="row.is_top === 1" @change="(val) => handleUpdateTop(row, val)" />
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" min-width="170" align="center">
                    <template #default>
                        <el-button size="small" :icon="View">
                            查看
                        </el-button>
                        <el-button type="danger" size="small" :icon="Delete">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 分页 -->
        <el-pagination v-model:current-page="queryItems.page_num" v-model:page-size="queryItems.page_size"
            :page-sizes="[5, 10, 15]" :total="total" layout=" total, prev, pager, next ,sizes"
            style="margin-top: 20px; justify-content: flex-end;" />
    </el-card>
</template>


<style lang="scss" scoped>
.heard {
    display: flex;
    align-items: center;
    // 两端对齐
    justify-content: space-between;
    padding: 16px 20px;
}

.heard-right {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    width: 60%;
}

.search-wrapper {
    display: flex;
    /* 左侧区域靠左，右侧按钮靠右 */
    justify-content: space-between;
    // 自动换行
    flex-wrap: wrap;
    align-items: flex-start;
    background-color: #f7f8fa;
    border: 1px solid #7e7f7f;
    border-radius: 8px;
    margin-bottom: 20px;
    padding: 20px 20px 0 20px;
    position: relative;
    padding-right: 180px;


}

.search-form:deep(.el-input) {
    --el-input-width: 200px
}

.search-form :deep(.el-select) {
    --el-select-width: 200px;
}

.search-left {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.search-button {
    position: absolute;
    top: 18px;
    /* 和输入框顶部对齐 */
    right: 20px;
    /* 死死贴在右侧 */
    display: flex;
    gap: 10px;

    /* 推到最右边 */
    margin-left: auto;
    // 保证自己不被压缩 
    flex-shrink: 0;
    align-items: flex-start;


}

// * 消除 el-form-item 默认的底部间距，用 gap 代替，保证对齐 */
:deep(.el-form-item) {
    margin-bottom: 16px;
    margin-right: 0;
}
</style>