import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', () => {
  // 侧边栏是否折叠
  const isCollapsed = ref(false)
  // 登录状态
  const isLogin = ref(true)
  return { isCollapsed, isLogin }
})
