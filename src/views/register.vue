<template>
    <div class="container">
        <div class="title">
            <div class="title-text">
                <h2>创建您的用户</h2>
                <p>请填写注册信息</p>
            </div>
        </div>
        <div class="form-container">
            <el-form :model="formData" :rules="rules" ref="summitFormRef" label-position="top" @keyup.enter="submitForm(summitFormRef)">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="formData.username" placeholder="请输入用户名" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="formData.email" placeholder="请输入邮箱" />
                </el-form-item>
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="formData.nickname" placeholder="请输入昵称" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                    <el-input v-model="formData.phone" placeholder="请输入手机号" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="formData.password" placeholder="请输入密码" type="password" show-password />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="formData.confirmPassword" placeholder="请确认密码" type="password" show-password />
                </el-form-item>
                <el-button type="primary" @click="submitForm(summitFormRef)" class="btn" size="large">创建账户</el-button>
            </el-form>
            <div class="footer">
                <p>已有账号？<router-link to="/auth/login" @click="mainStore.isLogin = true" style="color: #409eff;">去登录</router-link></p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { register } from '@/api/admin'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useMainStore } from '@/stores'

const router = useRouter()
const mainStore = useMainStore()

const formData = ref({
    username: '',
    email: '',
    nickname: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 0,
    userType: 1
})

const rules = ref({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' }
    ],
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' }
    ]
})

const summitFormRef = ref<any>(null)

const submitForm = async (formEl: any) => {
    if (!formEl) return
    formEl.validate(async (valid: boolean) => {
        if (valid) {
            const res = await register(formData.value)
            if (res.data.code === '200') {
                ElMessage.success('注册成功')
                router.push({ name: 'login' })
            } else {
                ElMessage.error(res.data.message)
            }
        } else {
            ElMessage.error('请填写完整信息')
        }
    })
}
</script>

<style scoped lang="scss">
.container {
    width: 384px;

    .flex-box {
        display: flex;
        align-items: center;
    }

    .title {
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

        .btn {
            margin-top: 40px;
            width: 100%;
        }

        .footer {
            padding: 30px;
            text-align: center;
        }
    }
}
</style>
