import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const activePath = localStorage.getItem('activePath')
const backendroutes: RouteRecordRaw[] = [
  // 后台管理系统路由
  {
    path: '/back',
    component: () => import('@/components/BackendLayout.vue'),
    redirect: `/back/${activePath || 'dashboard'}`,
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard.vue'),
        meta: {
          title: '数据分析',
          icon: 'PieChart',
        }
      },
      {
        path: 'knowledge',
        component: () => import('@/views/knowledge.vue'),
        meta: {
          title: '知识文章',
          icon: 'ChatLineSquare',
        }
      },
      {
        path: 'consultations',
        component: () => import('@/views/consultations.vue'),
        meta: {
          title: '咨询记录',
          icon: 'Message',
        }
      },
      {
        path: 'emotional',
        component: () => import('@/views/emotional.vue'),
        meta: {
          title: '情绪日志',
          icon: 'User',
        }
      }
    ],
  },
  //登录路由
  {
    path: '/auth',
    component: () => import('@/components/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/login.vue'),
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/register.vue'),
      },
    ],
  }
]

const frontendRoutes: RouteRecordRaw[] = [
  //前台路由
  {
    path: '/',
    component: () => import('@/components/FrontendLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/home.vue'),
      },
      {
        path: 'consultation',
        component: () => import('@/views/consultation.vue'),
      },
      {
        path: 'emotion-diary',
        component: () => import('@/views/emotionDiary.vue'),
      },
      {
        path: 'knowledge',
        component: () => import('@/views/frontendKnowledge.vue'),
      },
      {
        path: 'knowledge/article/:id',
        component: () => import('@/views/articleDetail.vue'),
      },
    ]
  },
]

const defaultRoutes: RouteRecordRaw[] = [
  //404路由
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...backendroutes, ...frontendRoutes, ...defaultRoutes],
})

//路由前置守卫
router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  if (token) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (userInfo.userType == 2) {
      if (to.path.startsWith('/back')) {
        //如果访问后台管理系统路由，且有token，直接放行
        return true
      } else if (to.path == '/auth') {
        return `/back/${activePath || 'dashboard'}`
      }
    } else if (userInfo.userType == 1) {
      if (to.path.startsWith('/back') || to.path.startsWith('/auth')) {
        //如果访问后台管理系统路由，且有token，重定向到后台管理系统首页
        return `/`
      }
    }
  } else {
    if (to.path.startsWith('/back')) {
      //如果访问后台管理系统路由，且没有token，重定向到登录页
      return '/auth/login'
    } else if (to.path == '/auth') {
      return '/auth/login'
    }
    else {
      return true
    }
  }
})

export default router
