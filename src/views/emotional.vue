<template>
    <div>
        <PageHead title="情绪日志" />
        <tableSearch @search="handleSearch" :formItem="formItem" />
        <el-table :data="tableData" style="width: 100%" :loading="tableLoading">
            <el-table-column prop="userId" label="ID" width="80" />
            <el-table-column label="会话ID" width="100">
                <template #default="scope">
                    <el-avatar>
                        {{ scope.row.nickname }}
                    </el-avatar>
                </template>
            </el-table-column>
            <el-table-column prop="diaryDate" label="记录日期" width="120" />
            <el-table-column label="情绪评分">
                <template #default="scope">
                    <el-rate :model-value="scope.row.moodScore" :max="10" disabled class="score-colors"></el-rate>
                </template>
            </el-table-column>
            <el-table-column label="生活指标" width="120">
                <template #default="scope">
                    <div>
                        <p>睡眠：{{ scope.row.sleepQuality }}</p>
                        <p>压力：{{ scope.row.stressLevel }}</p>
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="情绪触发因素" width="120">
                <template #default="scope">
                    {{ scope.row.emotionTriggers ? scope.row.emotionTriggers : '无' }}
                </template>
            </el-table-column>
            <el-table-column prop="diaryContent" label="情绪内容" width="250" />
            <el-table-column label="操作" width="300" fixed="right">
                <template #default="scope">
                    <el-space :size="8">
                        <el-button @click="handleDetail(scope.row)" :style="{ padding: '0 6px' }" type="primary"
                            text>详情</el-button>
                        <el-button @click="handleDelete(scope.row)" :style="{ padding: '0 6px' }" type="danger"
                            text>删除</el-button>
                    </el-space>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination style="margin-top: 25px;" layout="prev, pager, next, jumper" :total="pagination.total"
            v-model:current-page="pagination.currentPage" v-model:page-size="pagination.size"
            @current-change="handleCurrentChange" />
        <el-dialog v-model="detailDialog" title="情绪日志详情" width="800px">
            <div v-if="currentDetail" class="detail-content">
                <div class="detail-section">
                    <h4>用户信息</h4>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="用户名">{{ currentDetail.username }}</el-descriptions-item>
                        <el-descriptions-item label="昵称">{{ currentDetail.nickname }}</el-descriptions-item>
                        <el-descriptions-item label="用户ID">{{ currentDetail.userId }}</el-descriptions-item>
                        <el-descriptions-item label="记录日期">{{ currentDetail.diaryDate }}</el-descriptions-item>
                    </el-descriptions>
                </div>
                <div class="detail-section">
                    <h4>情绪状态</h4>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="情绪评分">
                            <el-rate :model-value="currentDetail.moodScore" :max="10" disabled
                                class="score-colors"></el-rate>
                        </el-descriptions-item>
                        <el-descriptions-item label="主要情绪">
                            <el-tag :type="getEmotionTagType(currentDetail.dominantEmotion)">{{
                                currentDetail.dominantEmotion ?
                                    currentDetail.dominantEmotion : '-' }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="睡眠质量">{{ currentDetail.sleepQuality ? currentDetail.sleepQuality :
                            '-'
                        }}/5</el-descriptions-item>
                        <el-descriptions-item label="压力水平">{{ currentDetail.stressLevel ? currentDetail.stressLevel :
                            '-'
                        }}/5</el-descriptions-item>
                    </el-descriptions>
                </div>
                <div class="detail-section">
                    <h4>日记内容</h4>
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="情绪触发因素">{{ currentDetail.emotionTriggers ?
                            currentDetail.emotionTriggers :
                            '无' }}</el-descriptions-item>
                        <el-descriptions-item label="日记内容">{{ currentDetail.diaryContent ? currentDetail.diaryContent :
                            '无'
                        }}</el-descriptions-item>
                    </el-descriptions>
                </div>
                <div class="detail-section" v-if="currentDetail.hasAiEmotionAnalysis">
                    <h4>AI分析结果</h4>
                    <div class="ai-analysis-result">
                        <el-descriptions :column="2" border>
                            <el-descriptions-item label="主要情绪">
                                <el-tag :type="getAiEmotionTagType(AIData.primaryEmotion)">{{ AIData.primaryEmotion
                                    }}</el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="情绪强度">
                                <el-progress :percentage="AIData.emotionScore"
                                    :color="getEmotionScoreColor(AIData.emotionScore)" :stroke-width="8" />
                            </el-descriptions-item>
                            <el-descriptions-item label="风险等级">
                                <el-tag :type="getAiEmotionTagType(AIData.riskLevel)">{{ AIData.riskLevel }}</el-tag>
                            </el-descriptions-item>
                            <el-descriptions-item label="情绪性质">
                                <el-tag :type="AIData.isNegative ? 'danger' : 'success'">{{ AIData.isNegative ? '负面情绪' :
                                    '正面情绪'
                                    }}</el-tag>
                            </el-descriptions-item>
                        </el-descriptions>
                        <div class="ai-suggestion-section">
                            <h5>专业建议</h5>
                            <div class="suggestion-content">{{ AIData.suggestion }}</div>
                        </div>
                        <div class="ai-suggestion-section">
                            <h5>风险描述</h5>
                            <div class="risk-content">{{ AIData.riskDescription }}</div>
                        </div>
                        <div class="ai-suggestion-section">
                            <h5>改善建议</h5>
                            <ul class="improvement-list">
                                <li v-for="item in AIData.improvementSuggestion" :key="item">{{ item }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="detain-section">
                    <h4>时间信息</h4>
                    <el-descriptions :column="2" border>
                        <el-descriptions-item label="创建时间">{{ currentDetail.createdAt }}</el-descriptions-item>
                        <el-descriptions-item label="更新时间">{{ currentDetail.updatedAt }}</el-descriptions-item>
                    </el-descriptions>
                </div>
            </div>
            <template #footer>
                <el-button @click="detailDialog = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import PageHead from '@/components/PageHead.vue'
import tableSearch from '@/components/tableSearch.vue'
import { getEmotionDiaryList, deleteEmotionDiary } from '@/api/admin'
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

//列表
const tableData = ref([])
const formData = ref({})
const tableLoading = ref<boolean>(false)
const detailDialog = ref<boolean>(false)
const currentDetail = ref<any>(null)

// 分页参数
const pagination = ref({
    total: 0,
    size: 10,
    currentPage: 1,
})

const formItem = [
    {
        comp: 'input',
        label: '用户ID',
        prop: 'userId',
        placeholder: '请输入用户ID',
    },
    {
        comp: 'select',
        label: '情绪评分',
        prop: 'moodScoreRange',
        placeholder: '请选择评分范围',
        options: [
            {
                label: '全部',
                value: '0',
            },
            {
                label: '低分(1-3分)',
                value: '1-3',
            },
            {
                label: '中分(4-6分)',
                value: '4-6',
            },
            {
                label: '高分(7-10分)',
                value: '7-10',
            },
        ]
    }
]

// 获取情绪标签类型
const getEmotionTagType = (emotion: string) => {
    const emotionTypes = {
        '快乐': 'success',
        '平静': 'info',
        '兴奋': 'warning',
        '愤怒': 'danger',
        '悲伤': 'info',
        '焦虑': 'warning'
    }
    return emotionTypes[emotion as keyof typeof emotionTypes] || 'info'
}

const getAiEmotionTagType = (emotion: string) => {
    const emotionTagMap = {
        '快乐': 'success',
        '平静': 'success',
        '兴奋': 'warning',
        '满足': 'success',
        '愤怒': 'danger',
        '悲伤': 'info',
        '焦虑': 'warning',
        '恐惧': 'danger',
        '沮丧': 'info',
        '压力': 'warning'
    }
    return emotionTagMap[emotion as keyof typeof emotionTagMap] || 'info'
}
const getEmotionScoreColor = (score: number) => {
    if (score >= 80) return '#f56c6c'
    if (score >= 60) return '#e6a23c'
    if (score >= 40) return '#909399'
    return '#67c23a'
}

// 详情
const AIData = ref<any>(null)
const handleDetail = (row: any) => {
    currentDetail.value = row
    console.log(currentDetail.value)
    if (currentDetail.value.hasAiEmotionAnalysis) {
        AIData.value = JSON.parse(currentDetail.value.aiAnalysis)
    } else {
        AIData.value = {}
    }
    detailDialog.value = true
}

// 删除
const handleDelete = async (row: any) => {
    ElMessageBox.confirm('确认删除该条情绪日记吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
    }).then(async () => {
        const res = await deleteEmotionDiary(row.id)
        if (res.data.code === '200') {
            ElMessage.success('删除成功')
            fetchList()
        } else {
            ElMessage.error(res.data.msg || '删除失败')
        }
    })
}

// 搜索查询
const handleSearch = async (formData: any) => {
    tableLoading.value = true
    const params = {
        userId: formData.userId,
        moodScoreRange: formData.moodScoreRange,
        minMoodScore: formData.moodScoreRange.split('-')[0],
        maxMoodScore: formData.moodScoreRange.split('-')[1],
        current: pagination.value.currentPage,
        size: pagination.value.size
    }
    const res = await getEmotionDiaryList(params)
    if (res.data.code === '200') {
        tableData.value = res.data.data.records
        pagination.value.total = res.data.data.total
    }
    tableLoading.value = false
}

// 刷新列表（搜索 + 分页都走这里）
const fetchList = async () => {
    tableLoading.value = true
    const res = await getEmotionDiaryList({
        ...formData.value,
    })
    if (res.data.code === '200') {
        tableData.value = res.data.data.records
        pagination.value.total = res.data.data.total
    }
    tableLoading.value = false
}

onMounted(() => {
    fetchList()
})

// 分页切换
const handleCurrentChange = (val: number) => {
    pagination.value.currentPage = val
    fetchList()
}
</script>

<style scoped lang="scss">
/* 前3颗：红色 */
:deep(.score-colors .el-rate__item:nth-child(-n+3) .el-rate__icon.is-active) {
    color: #ff4d4f !important;
}

/* 中间3颗：黄色（第4、5、6颗） */
:deep(.score-colors .el-rate__item:nth-child(n+4):nth-child(-n+6) .el-rate__icon.is-active) {
    color: #ffc53d !important;
}

/* 后4颗：绿色（第7、8、9、10颗） */
:deep(.score-colors .el-rate__item:nth-child(n+7) .el-rate__icon.is-active) {
    color: #52c41a !important;
}

.detail-content {
    .detail-section {
        margin-bottom: 24px;

        h4 {
            margin: 0 0 16px 0;
            color: #303133;
            font-size: 16px;

            i {
                margin-right: 8px;
                color: #409eff;
            }
        }
    }
}

// AI分析相关样式
.ai-analysis-status {
    .ai-status-tag {
        margin-bottom: 4px;

        i {
            margin-right: 4px;
        }
    }

    .ai-analysis-preview {
        font-size: 11px;
        color: #909399;
        margin-top: 2px;
    }
}

.ai-analysis-result {

    .ai-keywords-section,
    .ai-suggestion-section,
    .ai-risk-section,
    .ai-improvements-section {
        margin-top: 16px;
        padding: 12px;
        background-color: #f8f9fa;
        border-radius: 4px;

        h5 {
            margin: 0 0 8px 0;
            color: #606266;
            font-size: 14px;
            font-weight: 600;

            i {
                margin-right: 6px;
                color: #909399;
            }
        }
    }

    .keywords-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .keyword-tag {
            background-color: #e1f3d8;
            color: #67c23a;
            border-color: #b3d8a4;
        }
    }

    .suggestion-content,
    .risk-content {
        line-height: 1.6;
        color: #606266;
        background-color: white;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ebeef5;
    }

    .improvement-list {
        margin: 0;
        padding-left: 20px;

        li {
            margin-bottom: 4px;
            color: #606266;
            line-height: 1.5;
        }
    }

    .ai-analysis-meta {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid #ebeef5;

        .analysis-time {
            margin: 0;
            font-size: 12px;
            color: #909399;

            i {
                margin-right: 4px;
            }
        }
    }

    .el-progress {
        .el-progress__text {
            font-size: 12px !important;
        }
    }
}
</style>