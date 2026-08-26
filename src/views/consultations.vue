<template>
    <div>
        <PageHead title="咨询记录" />
        <el-table :data="tableData" style="width: 100%" :loading="tableLoading">
            <el-table-column label="会话ID" width="100">
                <template #default="scope">
                    <el-avatar style="height:50px;width:50px;">{{ scope.row.userNickname || '无' }}</el-avatar>
                </template>
            </el-table-column>
            <el-table-column label="情绪日志">
                <template #default="scope">
                    <div class="section-title">{{ scope.row.sessionTitle || '无' }}</div>
                    <div class="section-preview">{{ scope.row.lastMessageContent || '无' }}</div>
                </template>
            </el-table-column>
            <el-table-column prop="messageCount" label="消息数" width="100" />
            <el-table-column prop="lastMessageTime" label="时间" width="200" />
            <el-table-column prop="operation" label="操作" width="100">
                <template #default="scope">
                    <el-button type="primary" text size="default" @click="handleDetail(scope.row)">查看详情</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination style="margin-top: 25px;" layout="prev, pager, next, jumper" :total="pagination.total"
            v-model:current-page="pagination.currentPage" v-model:page-size="pagination.size"
            @current-change="handleCurrentChange" />
        <el-dialog v-model="showDetailDialog" title="咨询会话详情" width="70%" :close-on-click-modal="false">
            <div class="session-detail">
                <div class="detail-header">
                    <div class="detail-row">
                        <div class="detail-label">用户：</div>
                        <div class="detail-value">{{ detailData.userNickname || '无' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">开始时间：</div>
                        <div class="detail-value">{{ detailData.startedAt || '无' }}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">消息数：</div>
                        <div class="detail-value">{{ detailData.messageCount || '无' }}条</div>
                    </div>
                </div>
                <div class="message-container">
                    <div class="message-header">
                        <h4>对话记录</h4>
                    </div>
                    <div class="message-list" v-loading="loading">
                        <div v-for="item in messageList" :key="item.id" class="message-item"
                            :class="item.senderType === 1 ? 'user-message' : 'ai-message'">
                            <div class="message-header">
                                <span class="sender">{{ item.senderType === 1 ? '用户' : 'AI助手' }}</span>
                                <span class="time">{{ item.createdAt}}</span>
                            </div>
                            <div class="message-content">{{ item.content }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <el-button @click="showDetailDialog = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import PageHead from '@/components/PageHead.vue'
import { ref, onMounted } from 'vue'
import { getConsultationList, getConsultationDetail } from '@/api/admin'

const showDetailDialog = ref(false)
const pagination = ref({
    currentPage: 1,
    size: 10,
    total: 0
})

const loading = ref<boolean>(false)
const tableData = ref<any>([])
const detailData = ref<any>({})
const messageList = ref<any>([])
const tableLoading = ref<boolean>(false)
onMounted(async () => {
    tableLoading.value = true
    const res = await getConsultationList({
        currentPage: pagination.value.currentPage.toString(),
        size: pagination.value.size.toString()
    })
    if (res.data.code === '200') {
        tableData.value = res.data.data.records
        pagination.value.total = res.data.data.total
    }
    tableLoading.value = false
})

// 查看详情
const handleDetail = async (row: any) => {
    showDetailDialog.value = true
    loading.value = true
    const res = await getConsultationDetail(row.id)
    if (res.data.code === '200') {
        loading.value = false
        messageList.value = res.data.data
        detailData.value = row
    }
}

// 刷新列表（搜索 + 分页都走这里）
const fetchList = async () => {
    tableLoading.value = true
    const res = await getConsultationList({
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
</script>

<style scoped lang="scss">
.session-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
}

.session-preview {
    font-size: 13px;
    color: #666;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.session-detail {
    max-height: 70vh;
    overflow-y: auto;

    .detail-header {
        margin-bottom: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
    }

    .detail-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        :last-child {
            margin-bottom: 0;
        }

        .detail-label {
            font-weight: 500;
            color: #495057;
            min-width: 80px;
            margin-right: 8px;
        }

        .detail-value {
            color: #333;
        }
    }
}

.message-container {
    margin-top: 20px;

    .message-header {
        margin-bottom: 16px;

        h4 {
            margin: 0;
            color: #333;
            font-size: 16px;
            font-weight: 500;
        }
    }

    .message-list {
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 16px;
        background: #fff;

        .message-item {
            margin-bottom: 12px;
            padding: 12px;
            border-radius: 8px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;

            :last-child {
                margin-bottom: 0;
            }

            &.user-message {
                background: #e8f4fd;
            }

            &.ai-message {
                background: #f0f9f0;
            }
        }

        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .sender {
                font-weight: 500;
                color: #333;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .time {
                font-size: 12px;
                color: #999;
            }

            .message-content {
                color: #333;
                line-height: 1.6;
                white-space: pre-wrap;
                margin-top: 8px;
                font-size: 14px;
            }
        }
    }
}
</style>
