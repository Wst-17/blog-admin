<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissionStore, useTagStore } from '@/store'
// 🌟 1. 补充引入你需要的 Element Plus 图标
import {
    HomeFilled, Document, Setting, User, Monitor, Menu,
    Lock, Message, Tickets, Avatar, List
} from '@element-plus/icons-vue'
import { useThemeStore } from '@/store'

const themeStore = useThemeStore()

const router = useRouter()
const curRoute = useRoute()
const permissionStore = usePermissionStore()
const tagStore = useTagStore()

// 🌟 2. 必须改成 path！Element Plus 的 default-active 匹配的是 path（也就是 index）
// 计算出当前应该在左侧菜单里点亮（高亮）哪一个菜单项
const activeKey = computed(() => curRoute.meta?.activeMenu || curRoute.path)

const menuOptions = computed(() => {
    return permissionStore.menus
        .map(item => getMenuItem(item))
        .sort((a, b) => a.order - b.order)
})


function resolvePath(basePath, path) {
    if (isExternal(path)) return path
    return (
        `/${[basePath, path]
            .filter(path => !!path && path !== '/')
            .map(path => path.replace(/(^\/)|(\/$)/g, ''))
            .join('/')}`
    )
}

function getMenuItem(route, basePath = '') {
    let menuItem = {
        label: route.meta?.title || route.name,
        key: route.name,
        path: resolvePath(basePath, route.path),
        icon: route.meta?.icon,
        order: route.meta?.order || 0,
        children: []
    }
    // 拿到当前路由下，所有“有名字”且“没被隐藏”的子路由
    const visibleChildren = route.children?.filter(e => e.name && !e.isHidden) ?? []

    if (!visibleChildren.length) return menuItem

    if (route.isCatalogue) {
        const singleRoute = visibleChildren[0]
        menuItem = {
            label: singleRoute.meta?.title || singleRoute.name,
            key: singleRoute.name,
            path: resolvePath(menuItem.path, singleRoute.path),
            icon: singleRoute.meta?.icon,
            order: menuItem.order,
            children: []
        }
        const visibleItems = singleRoute.children?.filter(item => item.name && !item.isHidden) ?? []
        if (visibleItems.length === 1) {
            menuItem = getMenuItem(visibleItems[0], menuItem.path)
        } else if (visibleItems.length > 1) {
            menuItem.children = visibleItems
                .map(item => getMenuItem(item, menuItem.path))
                .sort((a, b) => a.order - b.order)
        }
    } else {
        menuItem.children = visibleChildren
            .map(item => getMenuItem(item, menuItem.path))
            .sort((a, b) => a.order - b.order)
    }
    return menuItem
}

// 🌟 3. 修复图标映射！把你的长字符串 mock 图标映射到 Element Plus 组件
const iconMap = {
    'ic:sharp-home': HomeFilled,
    'ic:twotone-article': Document,
    'cib:adguard': Lock,
    'ic:twotone-email': Message,
    'ph:user-list-bold': User,
    'ion:md-settings': Setting,
    'material-symbols:receipt-long-outline-rounded': Tickets,
    'mdi:account': Avatar,
    // 子菜单图标
    'icon-park-outline:write': Document,
    'material-symbols:format-list-bulleted': List,
}

function getIcon(iconName) {
    if (!iconName) return null
    // 如果匹配到了就用，没匹配到用 Monitor 兜底
    return iconMap[iconName] || Monitor
}

function handleMenuSelect(index, indexPath, item) {
    if (isExternal(index)) {
        window.open(index, '_blank', 'noopener,noreferrer')
        return
    }
    // 防抖（防止重复点击）
    if (index === curRoute.path) return
    // 更新标签缓存
    if (!tagStore.tags.some(e => e.path === index)) {
        tagStore.updateAliveKey(item.key || index)
    }
    router.push(index)
}

function isExternal(path) {
    return /^(?:https?:|mailto:|tel:)/.test(path)
}
</script>

<template>
    <!-- 🌟 4. 补充 router 和 unique-opened 属性 -->
    <!--router 让菜单点击直接触发路由跳转 -->
    <!-- unique-opened当你点击“用户管理”时，Element Plus 会自动把“文章管理”收起来。这样侧边栏永远保持清爽，视觉焦点永远只有一个。 -->
    <el-menu :default-active="activeKey" class="side-menu" router unique-opened @select="handleMenuSelect"
        :collapse="themeStore.collapsed" :collapse-transition="false">
        <template v-for="item in menuOptions" :key="item.path">
            <!-- 有子菜单 -->
            <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
                <template #title>
                    <el-icon v-if="item.icon">
                        <component :is="getIcon(item.icon)" />
                    </el-icon>
                    <span>{{ item.label }}</span>
                </template>

                <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
                    <el-icon v-if="child.icon">
                        <component :is="getIcon(child.icon)" />
                    </el-icon>
                    <template #title>{{ child.label }}</template>
                </el-menu-item>
            </el-sub-menu>

            <!-- 无子菜单 -->
            <el-menu-item v-else :index="item.path">
                <el-icon v-if="item.icon">
                    <component :is="getIcon(item.icon)" />
                </el-icon>
                <template #title>{{ item.label }}</template>
            </el-menu-item>
        </template>
    </el-menu>
</template>

<style lang="scss" scoped>
/* 你的样式保留即可 */
/* 去除菜单默认的右边框和背景 */
.side-menu {
    border-right: none;

}

:deep(.el-sub-menu__title),
:deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    margin: 4px, 12px;
    border-radius: 6px;
    // 把元素的背景色设置为“透明”加上了 !important 才能强行把它的底色剥掉
    background-color: transparent !important;
    border-left: 4px solid transparent;
}

// 鼠标悬停的样式
:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
    background-color: #f2f2f5 !important;
    color: var(--el-color-primary);
}

// 选中（Active）状态
:deep(.el-menu-item.is-active) {
    background-color: #f0f4f4 !important;
    color: var(--el-color-primary);
    // 左侧粗条
    border-left: 4px solid var(--el-color-primary);
    font-weight: 600;

}

/* 4. 修复选中时图标颜色 */
:deep(.el-menu-item.is-active .el-icon) {
    color: var(--el-color-primary);
}

/* 5. 子菜单缩进调整（让二级菜单看起来更紧凑） */
:deep(.el-sub-menu .el-menu-item) {
    padding-left: 48px;
    /* 给二级菜单留出缩进空间 */
}

/* 6. 展开的父级菜单（有子菜单的那个）文字颜色 */
:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    color: var(--el-color-primary);
}
</style>