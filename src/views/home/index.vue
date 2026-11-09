<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { View, User, Document, ChatDotRound } from '@element-plus/icons-vue'
import api from '@/api'
import { useUserStore } from '@/store'
import { formatDate } from '@/utils'

// 不解构 store: 解构后失去响应性
const userStore = useUserStore()
const router = useRouter()

const homeInfo = ref({
    view_count: 0,
    user_count: 0,
    article_count: 0,
    message_count: 0,
    view_trend: [],
    visitor_area: [],
})

// 待处理事项
const todo = ref({ comment: 0, message: 0, recycle: 0, online: 0 })
const latestArticles = ref([])
const categoryStat = ref([])
const loginLogs = ref([])
const loading = ref(true)

const STATUS_MAP = {
    1: { text: '公开', type: 'success' },
    2: { text: '私密', type: 'warning' },
    3: { text: '草稿', type: 'info' },
}

// 分类分布按最大值归一化
const maxCategoryCount = computed(() =>
    Math.max(1, ...categoryStat.value.map(c => c.article_count ?? 0)),
)

// 访问趋势
const viewTrend = computed(() => homeInfo.value.view_trend ?? [])
const maxTrendCount = computed(() => Math.max(1, ...viewTrend.value.map(d => d.count ?? 0)))
const trendTotal = computed(() => viewTrend.value.reduce((sum, d) => sum + (d.count ?? 0), 0))

// 访客地域
const visitorArea = computed(() => homeInfo.value.visitor_area ?? [])
const maxAreaCount = computed(() => Math.max(1, ...visitorArea.value.map(a => a.count ?? 0)))

const todoItems = computed(() => [
    { label: '待审核评论', value: todo.value.comment, path: '/message/comment' },
    { label: '待审核留言', value: todo.value.message, path: '/message/leave-msg' },
    { label: '回收站文章', value: todo.value.recycle, path: '/article/list' },
    { label: '当前在线用户', value: todo.value.online, path: '/user/online' },
])

// 每块数据独立取, 用 allSettled: 某个接口挂了不该让整个面板空着
async function fetchDashboard() {
    loading.value = true
    const [comment, message, recycle, articles, categories, logs, online] = await Promise.allSettled([
        api.getComments({ page_num: 1, page_size: 1, is_review: false }),
        api.getMessages({ page_num: 1, page_size: 1, is_review: false }),
        api.getArticles({ page_num: 1, page_size: 1, is_delete: true }),
        api.getArticles({ page_num: 1, page_size: 5, is_delete: false }),
        api.getCategorys({ page_num: 1, page_size: 100 }),
        api.getLoginLogs({ page_num: 1, page_size: 5 }),
        api.getOnlineUsers({ keyword: '' }),
    ])

    const total = r => (r.status === 'fulfilled' ? r.value?.data?.total ?? 0 : 0)
    const list = r => (r.status === 'fulfilled' ? r.value?.data?.page_data ?? [] : [])

    todo.value = {
        comment: total(comment),
        message: total(message),
        recycle: total(recycle),
        online: online.status === 'fulfilled' ? (online.value?.data ?? []).length : 0,
    }
    latestArticles.value = list(articles)
    loginLogs.value = list(logs)
    categoryStat.value = list(categories)
        .slice()
        .sort((a, b) => (b.article_count ?? 0) - (a.article_count ?? 0))
        .slice(0, 5)
    loading.value = false
}

onMounted(async () => {
    getOneSentence()
    fetchDashboard()
    try {
        const res = await api.getHomeInfo()
        if (res.data) {
            homeInfo.value = res.data
        }
    } catch (err) {
        console.error(err)
    }
})

// 一言: 每次进后台看到一句新的文案
const FALLBACK_SENTENCES = [
    '宠辱不惊，看庭前花开花落；去留无意，望天上云卷云舒。',
    '书山有路勤为径，学海无涯苦作舟。',
    '纸上得来终觉浅，绝知此事要躬行。',
    '不积跬步，无以至千里；不积小流，无以成江海。',
    '路漫漫其修远兮，吾将上下而求索。',
    '业不可不勤，勤则百弊自去。',
    '博观而约取，厚积而薄发。',
]
function randomSentence() {
    return FALLBACK_SENTENCES[Math.floor(Math.random() * FALLBACK_SENTENCES.length)]
}

const sentence = ref(randomSentence())
async function getOneSentence() {
    try {
        const resp = await fetch('https://v1.hitokoto.cn?c=i', { signal: AbortSignal.timeout(2000) })
        const data = await resp.json()
        if (data?.hitokoto) {
            sentence.value = data.hitokoto
        }
    } catch {
        // 保持内置文案
    }
}
</script>

<template>
    <div class="home-page">
        <!-- 1. 顶部问候卡片 -->
        <el-card shadow="never" class="greeting-card">
            <div class="greeting-wrap">
                <el-avatar :size="60" :src="userStore.avatar" />
                <div class="greeting-text">
                    <p class="hello"> Hello, {{ userStore.nickname }} </p>
                    <p class="sentence">{{ sentence }}</p>
                </div>
            </div>
        </el-card>
        <!-- 2. 总量统计 -->
        <el-row :gutter="16" class="stat-row">
            <el-col :span="6" v-for="item in [
                { icon: View, color: '#316C72', label: '访问量', key: 'view_count' },
                { icon: User, color: '#18A058', label: '用户量', key: 'user_count' },
                { icon: Document, color: '#2080F0', label: '文章量', key: 'article_count' },
                { icon: ChatDotRound, color: '#F0A020', label: '留言量', key: 'message_count' },
            ]" :key="item.key">
                <el-card shadow="hover" class="stat-card">
                    <div class="stat-content">
                        <el-icon :size="48" :color="item.color">
                            <component :is="item.icon" />
                        </el-icon>
                        <div class="stat-info">
                            <span class="stat-label">{{ item.label }}</span>
                            <span class="stat-value">{{ homeInfo[item.key] ?? '-' }}</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <!-- 3. 访问趋势柱状图 -->
        <el-card shadow="never" class="mt-16">
            <template #header>
                <div class="card-header">
                    <span>访问趋势</span>
                    <span class="header-extra">近 {{ viewTrend.length }} 天共 {{ trendTotal }} 次</span>
                </div>
            </template>
            <el-empty v-if="!trendTotal" description="最近还没有访问记录" />
            <div v-else class="trend-chart">
                <div v-for="day of viewTrend" :key="day.date" class="trend-bar-wrap"
                    :title="`${day.date} · ${day.count} 次`">
                    <span class="trend-count">{{ day.count || '' }}</span>
                    <div class="trend-bar"
                        :style="{ height: `${Math.max(2, Math.round((day.count ?? 0) / maxTrendCount * 100))}%` }" />
                    <span class="trend-date">{{ day.date.slice(5) }}</span>
                </div>
            </div>
        </el-card>

        <!-- 4. 待处理 + 最新文章 -->
        <el-row :gutter="16" class="mt-16">
            <el-col :span="8">
                <el-card shadow="never" class="h-full">
                    <template #header>
                        <div class="card-header"><span>待处理</span></div>
                    </template>
                    <div class="todo-list">
                        <div v-for="item of todoItems" :key="item.label" class="todo-item"
                            @click="router.push(item.path)">
                            <span class="text">{{ item.label }}</span>
                            <el-skeleton v-if="loading" :rows="0" animated style="width: 24px" />
                            <span v-else class="value" :class="{ 'is-active': item.value > 0 }">{{ item.value }}</span>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="16">
                <el-card shadow="never" class="h-full">
                    <template #header>
                        <div class="card-header">
                            <span>最新文章</span>
                            <span class="header-extra link" @click="router.push('/article/list')">全部</span>
                        </div>
                    </template>
                    <el-skeleton v-if="loading" :rows="5" animated />
                    <el-empty v-else-if="!latestArticles.length" description="还没有文章" />
                    <div v-else class="article-list">
                        <div v-for="article of latestArticles" :key="article.id" class="article-item"
                            @click="router.push(`/article/write/${article.id}`)">
                            <span class="title">{{ article.title }}</span>
                            <el-tag v-if="article.category" size="small" type="info">{{ article.category.name
                            }}</el-tag>
                            <el-tag size="small" :type="STATUS_MAP[article.status]?.type || 'info'">
                                {{ STATUS_MAP[article.status]?.text || '未知' }}
                            </el-tag>
                            <span class="date">{{ formatDate(article.created_at) }}</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 5. 分类分布 + 访客地域 + 最近登录 -->
        <el-row :gutter="16" class="mt-16">
            <el-col :span="8">
                <el-card shadow="never" class="h-full">
                    <template #header>
                        <div class="card-header">
                            <span>分类分布</span>
                            <span class="header-extra link" @click="router.push('/article/category')">全部</span>
                        </div>
                    </template>
                    <el-skeleton v-if="loading" :rows="4" animated />
                    <el-empty v-else-if="!categoryStat.length" description="还没有分类" />
                    <div v-else class="progress-list">
                        <div v-for="c of categoryStat" :key="c.id" class="progress-item">
                            <div class="progress-label">
                                <span>{{ c.name }}</span>
                                <span>{{ c.article_count ?? 0 }} 篇</span>
                            </div>
                            <el-progress :percentage="Math.round((c.article_count ?? 0) / maxCategoryCount * 100)"
                                :show-text="false" :stroke-width="6" color="#316C72" />
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="8">
                <el-card shadow="never" class="h-full">
                    <template #header>
                        <div class="card-header">
                            <span>访客地域</span>
                            <span class="header-extra">按独立访客数</span>
                        </div>
                    </template>
                    <el-skeleton v-if="loading" :rows="4" animated />
                    <el-empty v-else-if="!visitorArea.length" description="还没有访客记录" />
                    <div v-else class="progress-list">
                        <div v-for="item of visitorArea" :key="item.area" class="progress-item">
                            <div class="progress-label">
                                <span>{{ item.area }}</span>
                                <span>{{ item.count }} 人</span>
                            </div>
                            <el-progress :percentage="Math.round((item.count ?? 0) / maxAreaCount * 100)"
                                :show-text="false" :stroke-width="6" color="#316C72" />
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :span="8">
                <el-card shadow="never" class="h-full">
                    <template #header>
                        <div class="card-header">
                            <span>最近登录</span>
                            <span class="header-extra link" @click="router.push('/log/login')">全部</span>
                        </div>
                    </template>
                    <el-skeleton v-if="loading" :rows="5" animated />
                    <el-empty v-else-if="!loginLogs.length" description="还没有登录记录" />
                    <div v-else class="login-list">
                        <div v-for="log of loginLogs" :key="log.id" class="login-item">
                            <span class="name">{{ log.nickname || log.username || '未知' }}</span>
                            <span class="ip">{{ log.ip_address }} · {{ log.ip_source || '未知' }}</span>
                            <el-tag size="small" :type="log.status === 1 ? 'success' : 'danger'">
                                {{ log.status === 1 ? '成功' : '失败' }}
                            </el-tag>
                            <span class="date">{{ formatDate(log.created_at, 'MM-DD HH:mm:ss') }}</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<style scoped>
.home-page {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.mt-16 {
    margin-top: 16px;
}

.h-full {
    height: 100%;
}


/* --- 1. 顶部问候卡片 --- */
.greeting-card {
    border-radius: 8px;
    border: none;
}

.greeting-wrap {
    display: flex;
    align-items: center;
}

.greeting-text {
    margin-left: 20px;
}

.hello {
    font-size: 18px;
    color: var(--el-text-color-primary);
    margin: 0 0 6px 0;
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

.github-link {
    margin-left: auto;
}

.github-link a {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    text-decoration: none;
    transition: color 0.3s;
}

.github-link a:hover {
    color: var(--el-color-primary);
}

/* --- 2. 统计卡片 --- */
.stat-row {
    margin-bottom: 0;
}

.stat-card {
    border-radius: 8px;
    border: none;
}

.stat-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
}

.stat-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.stat-label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 8px;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: var(--el-text-color-primary);
}

/* --- 通用卡片头部 --- */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-extra {
    font-size: 13px;
    color: var(--el-text-color-secondary);
}

.header-extra.link {
    cursor: pointer;
}

.header-extra.link:hover {
    color: var(--el-color-primary);
}

/* --- 3. 趋势图 --- */
.trend-chart {
    height: 140px;
    display: flex;
    align-items: flex-end;
    gap: 4px;
    padding-top: 10px;
}

.trend-bar-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
}

.trend-count {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: 4px;
}

.trend-bar {
    width: 100%;
    background-color: var(--el-color-primary);
    border-radius: 4px 4px 0 0;
    transition: height 0.3s;
    opacity: 0.8;
}

.trend-bar:hover {
    opacity: 1;
}

.trend-date {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 6px;
    white-space: nowrap;
}

/* --- 4. 待处理 & 最新文章 --- */
.todo-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.todo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
}

.todo-item:hover {
    background-color: var(--el-fill-color-light);
}

.todo-item .text {
    font-size: 14px;
}

.todo-item .value {
    font-size: 18px;
    font-weight: bold;
    opacity: 0.4;
}

.todo-item .value.is-active {
    opacity: 1;
    color: var(--el-color-warning);
}

.article-list,
.login-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.article-item,
.login-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
}

.article-item:hover,
.login-item:hover {
    background-color: var(--el-fill-color-light);
}

.article-item .title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.article-item .date {
    width: 80px;
    text-align: right;
    font-size: 12px;
    color: var(--el-text-color-secondary);
}

.login-item .name {
    width: 70px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.login-item .ip {
    flex: 1;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.login-item .date {
    width: 125px;
    text-align: right;
    font-size: 12px;
    color: var(--el-text-color-secondary);
}

/* --- 5. 进度条列表 --- */
.progress-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.progress-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: var(--el-text-color-primary);
}
</style>
