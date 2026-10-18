// 存用户的数据
// 整体结构
// export const useUserStore = defineStore('user', {
//   state: () => ({ ... }),   // 数据
//   getters: { ... },         // 派生数据（只读）
//   actions: { ... },         // 修改数据的方法
// })
import api from '@/api'
import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      id: null,
      nickname: '',
      avatar: '', //头像
      intro: '',
      website: '',
      // roles: [], // TODO: 后端返回 roles
    },
  }),
  getters: {
    userId: (state) => state.userInfo.id,
    nickname: (state) => state.userInfo.nickname,
    intro: (state) => state.userInfo.intro,
    website: (state) => state.userInfo.website,
    avatar: (state) => convertImgUrl(state.userInfo.avatar),
    // roles: state => state.userInfo.roles,
  },
  actions: {
    // 获取用户信息
    async getUserInfo() {
      try {
        const resp = await api.getUserInfo()
        this.userInfo = resp.data
        return Promise.resolve(resp.data)
      } catch (err) {
        return Promise.reject(err)
      }
    },
  },
})
