<template>
    <el-aside :width="mainStore.isCollapsed ? '64px' : '264px'">
        <el-menu class="side-menu" :default-active="activePath">
            <div class="brand">
                <img src="@/assets/images/机器人.png" alt="logo"
                    :style="{ marginRight: mainStore.isCollapsed ? '0px' : '10px' }" />
                <div class="info-card" v-if="!mainStore.isCollapsed">
                    <h1 class="brand-title">心理健康AI助手</h1>
                    <p class="brand-subtitle">管理后台</p>
                </div>
            </div>
            <el-menu-item @click="selectMenu(item.path)" v-for="item in asideList" :key="item.path" :index="item.path">
                <el-icon>
                    <component :is="item.meta.icon" />
                </el-icon>
                <span v-if="!mainStore.isCollapsed">{{ item.meta.title }}</span>
            </el-menu-item>
        </el-menu>
    </el-aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useMainStore } from '@/stores'
const mainStore = useMainStore()
const asideList = ref<any>([])
const router = useRouter()
const activePath = ref(localStorage.getItem('activePath'))

onMounted(() => {
    asideList.value = router.options.routes[0]?.children || []
})
const selectMenu = (path: string) => {
    const currentRoute = router.options.routes[0]?.path;
    router.push(`${currentRoute}/${path}`)
    localStorage.setItem('activePath', path)
}
</script>

<style scoped lang="scss">
.side-menu {
    height: 100%;

    .brand {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px;
        background-color: #fff;
        border-bottom: 1px solid #e5e7eb;

        img {
            width: 50px;
            height: 50px;
        }

        .info-card {
            .brand-title {
                font-size: 20px;
                margin-bottom: 5px;
                color: #1f2937;
            }

            .brand-subtitle {
                font-size: 14px;
                color: #6b7280;
            }
        }
    }
}
</style>