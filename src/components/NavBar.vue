<template>
    <div class="navbar">
        <div class="flex-box">
            <el-button @click="toggleAside">
                <el-icon>
                    <component :is="mainStore.isCollapsed ? Expand : Fold" />
                </el-icon>
            </el-button>
            <p class="page-title">{{ route.meta.title }}</p>
        </div>
        <div class="flex-box">
            <el-dropdown @command="handleCommand">
                <div class="flex-box user-info">
                    <el-avatar src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
                    <p class="user-name">admin</p>
                    <el-icon>
                        <ArrowDown />
                    </el-icon>
                </div>
                <template #dropdown>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </template>
            </el-dropdown>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useMainStore } from '@/stores'
import { Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { logout } from '@/api/admin'
import { ElMessageBox, ElMessage } from 'element-plus'
const mainStore = useMainStore()
const route = useRoute()
const router = useRouter()

const handleCommand = (command: string) => {
    ElMessageBox.confirm('确定退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        // 退出登录逻辑
        logout().then(() => {
            ElMessage.success('退出成功')
            router.push({ name: 'login' })
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('userInfo')
        })
    })
}

const toggleAside = () => {
    mainStore.isCollapsed = !mainStore.isCollapsed
}
</script>

<style scoped lang="scss">
.navbar {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0px 15px;
    background-color: #fff;
    box-shadow: 0px 1px 4px rgba(0, 21, 41, 0.08);
    border-bottom: 1px solid #e5e7eb;

    .flex-box {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .user-info {
        margin-right: 20px;
        cursor: pointer;
    }

    .page-title {
        font-size: 20px;
        margin-left: 20px;
        font-weight: 700;
        color: #1f2937;
    }
}
</style>
