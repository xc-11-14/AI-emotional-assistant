<template>
    <div class="frontend-layout">
        <div class="navbar-container">
            <div class="brand-section">
                <img style="height: 50px;width: 50px;" src="@/assets/images/机器人.png" alt="AI Emotional Assistant" />
                <h1 class="brand-name">心理健康AI助手</h1>
            </div>
            <div class="nav-section">
                <router-link to="/" class="nav-link" :class="{ 'active': route.path === '/' }">首页</router-link>
                <router-link to="/consultation" class="nav-link" v-if="isLogin"
                    :class="{ 'active': route.path === '/consultation' }">AI咨询</router-link>
                <router-link to="/emotion-diary" class="nav-link" v-if="isLogin"
                    :class="{ 'active': route.path === '/emotion-diary' }">情绪日记</router-link>
                <router-link to="/knowledge" class="nav-link"
                    :class="{ 'active': route.path === '/knowledge' }">知识库</router-link>
                <el-button class="logout-btn" v-if="isLogin" @click="logout">退出登录</el-button>
                <template v-else>
                    <router-link to="/auth/login" class="nav-link">登录</router-link>
                    <router-link to="/auth/register" class="nav-link">
                        <el-button type="primary" style="margin-top: 5px;">注册</el-button>
                    </router-link>
                </template>
            </div>
        </div>
        <div class="main-container">
            <router-view></router-view>
        </div>
        <div class="footer-container">
            <p class="footer-bottom">
                &copy; 2026 AI心理助手.保留所有权利.
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const isLogin = ref(false)
onMounted(() => {
    isLogin.value = localStorage.getItem('token') !== null
})

const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    isLogin.value = false
    ElMessage.success('退出成功')
    router.push({ name: 'login' })
}
</script>

<style scoped lang="scss">
.frontend-layout {
    background-color: #fff;

    .navbar-container {
        max-width: 1200px;
        height: 100%;
        margin: 0 auto;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .brand-section {
            display: flex;
            align-items: center;

            .brand-name {
                margin-left: 10px;
                font-size: 24px;
                font-weight: 600;
                color: #333;
            }
        }

        .nav-section {
            display: flex;
            align-items: center;
            gap: 40px;

            .nav-link {
                color: #4b5563;
                font-size: 16px;
                font-weight: 500;

                &:hover {
                    color: #4A90E2;
                }
            }

            .active {
                color: #4A90E2 !important;
            }
        }
    }

    .footer-container {
        background: #1f2937;
        color: white;
        padding: 15px 0;
        margin-top: auto;

        .footer-bottom {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 10px;
            text-align: center;
        }
    }
}
</style>