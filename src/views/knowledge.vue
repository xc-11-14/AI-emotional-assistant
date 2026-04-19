<template>
    <div>
        <PageHead>
            <template #buttons>
                <el-button type="primary" @click="handleEdit({})">新增</el-button>
            </template>
        </PageHead>
        <tableSearch :formItem="formItem" @search="handleSearch" @reset="handleReset" />
        <el-table :data="tableData" style="width: 100%;margin-top: 25px;" v-loading="tableLoading">
            <el-table-column label="文章标题" >
                <template #default="scope">
                    <div style="display: flex; align-items: center; justify-content: center;">
                        <el-icon><timer /></el-icon> {{ scope.row.title }}
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="分类">
                <template #default="scope">
                    {{ categoryMap[scope.row.categoryId] || '未分类' }}
                </template>
            </el-table-column>
            <el-table-column label="作者" prop="authorName" />

            <el-table-column label="标签">
                <template #default="scope">
                    {{ scope.row.tags || '无' }}
                </template>
            </el-table-column>
            <el-table-column label="发布时间" prop="createdAt" />
            <el-table-column label="操作" width="450" fixed="right">
                <template #default="scope">
                    <el-space :size="8">
                        <el-button :style="{ padding: '0 6px' }" text type="primary" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button :style="{ padding: '0 6px' }" @click="handlePublish(scope.row)" type="success" text
                        v-if="scope.row.status === 0 || scope.row.status === 2">发布</el-button>
                        <el-button :style="{ padding: '0 6px' }" @click="handleOffline(scope.row)" type="warning" text v-else>下线</el-button>
                        <el-button :style="{ padding: '0 6px' }" @click="handleDelete(scope.row)" type="danger" text>删除</el-button>
                    </el-space>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination style="margin-top: 25px;" layout="prev, pager, next, jumper" :total="pagination.total"
            v-model:current-page="pagination.currentPage" v-model:page-size="pagination.size"
            @current-change="handleCurrentChange" />
        <ArticleDialog :currentArticle="currentArticle" v-model:modelValue="dialogVisible"
            :categoryList="categoryList" />
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHead from '@/components/PageHead.vue'
import tableSearch from '@/components/tableSearch.vue'
import ArticleDialog from '@/components/ArticleDialog.vue'
import { getCategoryTree, getArticleList, getArticleDetail, updateArticleStatus, deleteArticle } from '@/api/admin'
import { ElMessageBox, ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const categoryMap = ref<any>({})
const categoryList = ref<any>([])
const tableData = ref<any>([])
const currentArticle = ref<any>(null)
const tableLoading = ref(false)

// 分页参数
const pagination = ref({
    total: 0,
    size: 10,
    currentPage: 1,
})

// 父组件保存搜索条件，给分页使用
const searchParams = ref<any>({})

// 搜索表单项配置
const formItem = ref<any>([{
    comp: 'input',
    label: '文章标题',
    prop: 'title',
    placeholder: '请输入文章标题',
}, {
    comp: 'select',
    label: '分类',
    prop: 'categoryId',
    placeholder: '请选择分类',
    options: []
}, {
    comp: 'select',
    label: '状态',
    prop: 'status',
    placeholder: '请选择状态',
    options: [
        { label: '全部', value: '0' },
        { label: '草稿', value: '1' },
        { label: '已发布', value: '2' },
        { label: '已下线', value: '3' }
    ]
}])

onMounted(async () => {
    const res = await getCategoryTree()
    if (res.data.code === '200') {
        const allCategory = { label: '全部', value: '0 ' }
        categoryList.value = res.data.data.map((item: any) => {
            categoryMap.value[item.id] = item.categoryName
            return { label: item.categoryName, value: item.id }
        })
        categoryList.value.unshift(allCategory)
        formItem.value[1].options = categoryList.value
    }
    // 初始化查询
    handleSearch({})
})

// 保存条件
const handleSearch = async (formData: any) => {
    if (formData.categoryId === '0') {
        formData.categoryId = 0
    }
    searchParams.value = formData
    pagination.value.currentPage = 1
    fetchList()
}

// 重置
const handleReset = () => {
    searchParams.value = {}
    pagination.value.currentPage = 1
    fetchList()
}

// 刷新列表（搜索 + 分页都走这里）
const fetchList = async () => {
    tableLoading.value = true
    const res = await getArticleList({
        ...searchParams.value,
        currentPage: pagination.value.currentPage.toString(),
        size: pagination.value.size.toString()
    })
    if (res.data.code === '200') {
        tableData.value = res.data.data.records
        pagination.value.total = res.data.data.total
    }
    tableLoading.value = false
}

// 分页切换
const handleCurrentChange = (val: number) => {
    pagination.value.currentPage = val
    fetchList()
}

// 编辑数据回显
const handleEdit = async (row: any) => {
    if (!row.id) {
        currentArticle.value = null
        dialogVisible.value = true
    } else {
        const res = await getArticleDetail(row.id)
        if (res.data.code === '200') {
            currentArticle.value = res.data.data
            dialogVisible.value = true
        }
    }
}

//发布文章
const handlePublish = async (row: any) => {
    ElMessageBox.confirm(
        `确认发布文章${row.title}吗？`,
        '确认',
        {
            confirmButtonText: '确认发布',
            cancelButtonText: '取消',
            type: 'info',
        }
    ).then(async () => {
        await updateArticleStatus(row.id, 1)
        ElMessage.success('发布成功')
        fetchList()
    })
}

// 下线文章
const handleOffline = async (row: any) => {
    ElMessageBox.confirm(
        `确认下线文章${row.title}吗？`,
        '确认',
        {
            confirmButtonText: '确认下线',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        await updateArticleStatus(row.id, 2)
        ElMessage.success('下线成功')
        fetchList()
    })
}

// 删除文章
const handleDelete = async (row: any) => {
    ElMessageBox.confirm(
        `确认删除文章${row.title}吗？`,
        '确认',
        {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        await deleteArticle(row.id)
        ElMessage.success('删除成功')
        fetchList()
    })
}
</script>

<style scoped lang="scss"></style>