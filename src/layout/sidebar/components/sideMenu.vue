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
const activeKey = computed(() => curRoute.meta?.activeMenu || curRoute.path)

const menuOptions = computed(() => {
    return permissionStore.menus
        .map(item => getMenuItem(item))
        .sort((a, b) => a.order - b.order)
})

const menuRef = ref(null)

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
    if (index === curRoute.path) return

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
    <el-menu ref="menuRef" :default-active="activeKey" class="side-menu" router unique-opened @select="handleMenuSelect"
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
</style>