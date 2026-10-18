<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, Document, Setting, User, Menu } from '@element-plus/icons-vue'

const route = useRoute()

// 过滤出有 meta.title 的路由作为面包屑数据
const breadcrumbs = computed(() => {
  return route.matched.filter(item => !!item.meta?.title)
})

// 图标映射表
const iconMap = {
  home: HomeFilled,
  document: Document,
  setting: Setting,
  user: User,
  menu: Menu,
}

// 根据 meta 返回图标组件
function getIcon(meta) {
  if (!meta?.icon) return null
  return typeof meta.icon === 'string' ? iconMap[meta.icon] : meta.icon
}
</script>

  <template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item
      v-for="item in breadcrumbs"
      :key="item.path"
      :to="item.path !== route.path ? { path: item.path } : undefined"
    >
      <el-icon v-if="getIcon(item.meta)" class="bread-icon">
        <component :is="getIcon(item.meta)" />
      </el-icon>
      <span>{{ item.meta?.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped>
.bread-icon {
  margin-right: 4px;
  vertical-align: middle;
}
</style>