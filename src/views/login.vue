<template>
    <div class="container">
        <div class="title">
            <div class="title-text">
                <h2>登录您的账户</h2>
                <p>输入您的登录信息</p>
            </div>
        </div>
        <div class="form-container">
            <el-form ref="loginFormRef" :model="formData" :rules="rules" label-position="top"
                @keyup.enter="submitForm(loginFormRef)">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="formData.username" size="large" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="formData.password" size="large" placeholder="请输入密码" type="password"
                        show-password />
                </el-form-item>
                <el-button class="btn" type="primary" @click="submitForm(loginFormRef)" :loading="loginFlag"
                    size="large">{{ loginFlag ? '登录中' : '登录' }}</el-button>
            </el-form>
            <div class="footer">
                <p>还没有账号？<router-link to="/auth/register" @click="isLogin = false" style="color: #409eff;">去注册</router-link></p>
                <p>
                    <span @click="router.push({ name: 'home' })">点击这里</span>以返回首页
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { login } from '@/api/admin'
import { ElMessage } from 'element-plus'
import { useMainStore } from '@/stores/index'
import { useRouter } from 'vue-router'

const router = useRouter()
const mainStore = useMainStore()
const isLogin = ref(true)
const loginFormRef = ref<any>()
const loginFlag = ref(false)

const formData = ref<{
    username: string,
    password: string
}>
    ({
        username: '',
        password: ''
    })

const rules = ref({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
})

const submitForm = async (formEl: any) => {
    loginFlag.value = true
    if (!formEl) return
    await formEl.validate(async (valid: boolean) => {
        if (valid) {
            const res = await login(formData.value)
            ElMessage.success('登录成功')
            sessionStorage.setItem('userInfo', JSON.stringify(res.data.data.userInfo))
            sessionStorage.setItem('token', res.data.data.token)
            //根据用户角色判断跳转的路径
            if (res.data.data.userInfo.userType === 2) {
                router.push({ name: 'back' })
            } else {
                router.push({ name: 'home' })
            }
        }
    })
    loginFlag.value = false
}
</script>

<style scoped lang="scss">
.container {
    width: 384px;

    .title {
        .back-home {
            margin-bottom: 60px;
        }

        .title-text {
            text-align: center;

            h2 {
                font-size: 36px;
                margin-bottom: 10px;
            }

            p {
                font-size: 18px;
                color: #6b7280;
            }
        }
    }

    .form-container {
        margin-top: 30px;
        height: 400px;


        .btn {
            width: 100%;
            margin-top: 20px;
        }

        .footer {
            padding: 30px;
            text-align: center;

            span {
                cursor: pointer;
                color: #409eff;
            }
        }
    }
}
</style>