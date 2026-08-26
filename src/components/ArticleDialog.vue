<template>
    <el-dialog :title="isEdit ? '编辑文章' : '新增文章'" width="50%" v-model="dialogVisible">
        <el-form :model="formData" ref="formRef" :rules="rules" label-width="120px">
            <el-form-item label="文章标题" prop="title">
                <el-input v-model="formData.title" placeholder="请输入文章标题" maxlength="50" show-word-limit clearable />
            </el-form-item>
            <el-form-item label="文章分类" prop="categoryId">
                <el-select v-model="formData.categoryId" placeholder="请选择文章分类">
                    <el-option v-for="item in categoryList" :key="item.value" :value="item.value" :label="item.label" />
                </el-select>
            </el-form-item>
            <el-form-item label="文章摘要" prop="summary">
                <el-input type="textarea" v-model="formData.summary" placeholder="请输入文章摘要（可选）" maxlength="200"
                    show-word-limit :rows="4" resize="none" />
            </el-form-item>
            <el-form-item label="标签" prop="tags">
                <el-select v-model="formData.tagArray" placeholder="请选择标签" multiple style="width: 100%;">
                    <el-option v-for="item in commonTags" :key="item" :value="item" :label="item" />
                </el-select>
            </el-form-item>
            <el-form-item label="封面图片">
                <div class="cover-upload">
                    <el-upload :show-file-list="false" accept="image/*" class="avatar-uploader"
                        :http-request="uploadFile">
                        <div class="cover-placeholder" v-if="!imgURL">
                            <p>点击上传封面</p>
                        </div>
                        <img v-else :src="imgURL" alt="图片加载失败" width="120" height="120" class="cover-image" />
                    </el-upload>
                    <div class="cover-remove" v-if="imgURL">
                        <el-button type="danger" size="small" @click="removeCover">移除封面</el-button>
                    </div>
                </div>
            </el-form-item>
            <el-form-item label="文章内容" prop="content">
                <el-input show-word-limit :rows="8" type="textarea" v-model="formData.content" placeholder="请输入文章内容"
                    :maxlength="2000" resize="none" />
            </el-form-item>
        </el-form>
        <div v-if="btnPreview">
            <h3>预览效果</h3>
            <div v-html="formData.content"></div>
        </div>
        <template #footer>
            <el-button @click="btnPreview = !btnPreview">{{ btnPreview ? '隐藏预览' : '预览效果' }}</el-button>
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="loading">{{ isEdit ? '编辑' : '新增' }}{{ '文章'
            }}</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFilePart, addArticle, updateArticle } from '@/api/admin'
import { filePath } from '@/config/index'

//预览按钮显示隐藏
const btnPreview = ref<boolean>(false)
const formRef = ref<any>('')
const categoryList = ref<any>([])
const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    categoryList: {
        type: Array,
        default: () => []
    },
    currentArticle: {
        type: Object,
        default: null
    }
})
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
const isEdit = computed(() => !!props.currentArticle?.id)
const dialogVisible = computed({
    get() {
        return props.modelValue
    },
    set(val) {
        emit('update:modelValue', val)
    }
})

//监听下拉分类变化
watch(
    () => props.categoryList.slice(1),
    (newVal) => {
        categoryList.value = newVal
    },
    { deep: true }
)

watch(() => props.currentArticle, (newVal) => {
    if (newVal) {
        // 直接覆盖赋值
        formData.value = {
            title: "",
            content: "",
            coverImage: "",
            categoryId: 1,
            summary: "",
            tags: "",
            tagArray: [],
            id: "",
            ...newVal
        }
        if (newVal.tags) {
            formData.value.tagArray = newVal.tags.split(',')
        } else {
            formData.value.tagArray = []
        }
        businessId.value = newVal.id
        imgURL.value = newVal.coverImage ? filePath + newVal.coverImage : ''
    }
})

watch(() => props.modelValue, (open) => {
    if (open && !props.currentArticle) {
        // 打开弹窗 + 无编辑数据 → 清空表单
        formData.value = {
            title: "",
            content: "",
            coverImage: "",
            categoryId: 1,
            summary: "",
            tags: "",
            tagArray: [],
            id: ""
        }
        imgURL.value = ''
        businessId.value = ''
        btnPreview.value = false
    }
})

const handleClose = () => {
    emit('update:modelValue', false)
    if (formRef.value) formRef.value.resetFields()
    // 关闭时彻底重置
    formData.value = {
        title: "",
        content: "",
        coverImage: "",
        categoryId: 1,
        summary: "",
        tags: "",
        tagArray: [],
        id: ""
    }
    businessId.value = ''
    removeCover()
    btnPreview.value = false
}

//定义数据部分
interface ArticleFormData {
    title: string
    content: string
    coverImage: string
    categoryId: number
    summary: string
    tags: string
    tagArray?: string[]
    id?: string
}
const formData = ref<ArticleFormData>({
    "title": "",
    "content": "",
    "coverImage": "",
    "categoryId": 1,
    "summary": "",
    "tags": "",
    "tagArray": [],
    "id": ""
})
// 校验规则
const rules = ref({
    title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
    categoryId: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
    content: [{ required: true, message: '请输入文章内容', trigger: 'blur' }],
})
// 常用标签
const commonTags = [
    '情绪管理', '焦虑', '抑郁', '压力', '睡眠',
    '冥想', '正念', '放松', '心理健康', '自我成长',
    '人际关系', '工作压力', '学习方法', '生活技巧'
]

// 上传图片部分
const imgURL = ref('')
//UUID生成业务ID
const businessId = ref('')
const uploadFile = async (file: any) => {
    const isImage = file.file.type.startsWith('image/')
    const isLt5MB = file.file.size / 1024 / 1024 < 5
    if (!isImage) {
        ElMessage.error('请上传图片文件')
        return
    }
    if (!isLt5MB) {
        ElMessage.error('图片大小不能超过5MB')
        return
    }
    businessId.value = crypto.randomUUID()
    const res = await uploadFilePart(file.file, { businessId: businessId.value })
    if (res.data.code === '200') {
        ElMessage.success('上传成功')
        imgURL.value = filePath + res.data.data.filePath
        formData.value.coverImage = res.data.data.filePath
    }
}
// 移除封面
const removeCover = () => {
    imgURL.value = ''
    formData.value.coverImage = ''
}

//提交部分
const loading = ref<boolean>(false)
const handleSubmit = () => {
    formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            loading.value = true
            const submitData = {
                ...formData.value,
                tags: formData.value.tagArray?.join(',') || ''
            }
            delete submitData.tagArray
            if (formData.value.id) {
                // 编辑文章
                const res = await updateArticle(formData.value.id, submitData)
                if (res.data.code === '200') {
                    loading.value = false
                    ElMessage.success('编辑成功')
                    handleClose()
                } else {
                    loading.value = false
                    ElMessage.error(res.data.msg)
                }
            } else {
                // 新增文章
                const res = await addArticle(submitData)
                if (res.data.code === '200') {
                    loading.value = false
                    ElMessage.success('新增成功')
                    handleClose()
                } else {
                    loading.value = false
                    ElMessage.error(res.data.msg)
                }
            }
        } else {
            ElMessage.error('请填写完整信息')
        }
    })
}
</script>

<style scoped lang="scss">
.cover-placeholder {
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: #8b949e;
    background-color: #f6f8fa;
}
</style>