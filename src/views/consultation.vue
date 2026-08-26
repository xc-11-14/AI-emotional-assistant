<template>
  <div class="consultation-container">
    <div class="sidebar">
      <!-- AI助手信息 -->
      <div class="ai-assistant-info">
        <div class="breathing-circle">
          <img :src="imgURL" style="width: 25px; height: 25px;" alt="AI助手">
        </div>
        <h3 class="assistant-name">AI助手</h3>
        <div class="online-status">
          <div class="status-dot"></div>
          <span>在线服务中</span>
        </div>
      </div>
      <!-- 情绪花园 -->
      <div class="emotion-garden">
        <div class="garden-header">
          <h3 class="garden-title">情绪花园</h3>
        </div>
        <div class="emotion-info">
          <div class="emotion-name">{{ emotionGarden.primaryEmotion }}</div>
          <div class="emotion-score">{{ emotionGarden.emotionScore }}</div>
        </div>
        <div class="warm-tips">
          <div class="emotion-status-text">
            <span class="status-label">今天感觉</span>
            <span class="status-emotion">{{ emotionGarden.isNegative ? '需要关注' : '很不错' }}</span>
          </div>
          <div class="emotion-intensity">
            <span class="intensity-dots">
              <span class="dot" v-for="item in 3" :key="item"
                :class="{ 'active': getIntensityClass(emotionGarden.emotionScore) >= item }"></span>
              <span class="intensity-text">{{ getRiskText(emotionGarden.riskLevel) }}</span>
            </span>
          </div>
          <!-- 温暖建议卡片 -->
          <div class="warm-suggestion">
            <div class="suggestion-icon">💝</div>
            <div class="suggestion-content">
              <div class="suggestion-title">给你的小建议</div>
              <div class="suggestion-text">{{ emotionGarden.suggestion }}</div>
            </div>
          </div>
          <!-- 治愈行动 -->
          <div class="healing-actions">
            <div class="actions-title">治愈行动</div>
            <ul class="actions-list">
              <li class="action-item" v-for="item in emotionGarden.improvementSuggestions" :key="item">
                <div class="action-icon">✨</div>
                <div class="action-text">{{ item }}</div>
              </li>
            </ul>
          </div>
          <!-- 风险提示 -->
          <div class="risk-notice" v-if="emotionGarden.isNegative === true && emotionGarden.riskLevel > 1">
            <div class="notice-icon">🤗</div>
            <div class="notice-content">
              <div class="notice-title">温馨提示</div>
              <div class="notice-text">{{ emotionGarden.riskDescription }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- 会话列表 -->
      <div class="session-history">
        <h4 class="session-title">会话列表</h4>
        <div class="session-list">
          <div class="session-item" v-for="item in sessionList" :key="item.id" @click="selectSession(item)">
            <div class="session-info">
              <div class="session-title">
                <span>{{ item.sessionTitle }}</span>
                <div class="session-meta">
                  <span class="session-time">{{ item.startedAt }}</span>
                </div>
                <div class="session-preview">
                  {{ item.lastMessageContent || '暂无消息' }}
                </div>
                <div class="session-stats">
                  <span><el-icon>
                      <ChatRound />
                    </el-icon>{{ item.messageCount || 0 }}</span>
                  <span><el-icon>
                      <Clock />
                    </el-icon>{{ item.durationMinutes || 0 }} 分钟</span>
                </div>
              </div>
              <div class="session-actions">
                <el-button text type="danger" size="small" @click.stop="deleteSession(item.id)">
                  <el-icon>
                    <DeleteFilled />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="chat-main">
      <!-- 聊天框头部 -->
      <div class="chat-header">
        <div class="header-left">
          <div class="chat-avatar">
            <img src="../assets/images/like.png" alt="头像" style="width: 30px; height: 30px;">
          </div>
          <div class="chat-info">
            <h2>AI助手</h2>
            <p>快来和我聊天吧</p>
          </div>
        </div>
        <el-button circle @click="createNewSession" title="创建新对话">
          <el-icon>
            <Plus />
          </el-icon>
        </el-button>
      </div>
      <!-- 聊天消息区 -->
      <div class="chat-messages" ref="chatMessagesRef">
        <div v-if="(chatMessages).length === 0" class="message-item ai-message">
          <div class="message-avatar">
            <img src="../assets/images/robot-fill.png" alt="AI助手" style="width: 18px; height: 18px;">
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <p>你好，我是你的心理健康AI助手，有什么我可以帮助你的吗？</p>
            </div>
            <div class="message-time">刚刚</div>
          </div>
        </div>
        <div class="message-item" v-for="(item, index) in chatMessages" :key="item.id"
          :style="item.senderType === 1 ? 'justify-content: flex-end;' : 'justify-content: flex-start;'"
          :class="item.senderType === 1 ? 'user-message' : 'ai-message'">
          <div class="message-avatar" v-if="item.senderType === 2">
            <img src="/src/assets/images/users.png" alt="头像" style="width: 18px; height: 18px;">
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <!-- AI正在思考中 -->
              <div class="typing-indicator" v-if="item.senderType === 2 && isAIAnswer && !item.content">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
              <!-- AI错误提示 -->
              <div class="error-message" v-else-if="item.isError">
                <p>{{ item.content }}</p>
              </div>
              <!-- AI正常返回消息 -->
              <MarkRender v-else-if="item.senderType === 2 && !item.isError" :content="item.content"
                :is-ai-message="true" />
              <p v-else-if="item.content" v-html="formatMarkdown(item.content)"></p>
            </div>
            <div class="message-time">{{ isAIAnswer && item.senderType === 2 && index === chatMessages.length - 1 ?
              '正在回答...'
              : item.createdAt }}</div>
          </div>
          <div class="message-avatar" v-if="item.senderType === 1">
            <img src="/src/assets/images/robot-fill.png" alt="AI助手" style="width: 18px; height: 18px;">
          </div>
        </div>
      </div>
      <!-- 输入区 -->
      <div class="chat-input">
        <div class="input-container">
          <el-input class="message-input" v-model="userMessage" type="textarea" :rows="3" resize="none"
            :disabled="isAIAnswer" clearable placeholder="请输入您的问题..." @keyup="keyUp" />
          <div class="input-footer">
            <span>按回车发送，shift+回车换行</span>
            <span>{{ userMessage.length }}/500</span>
          </div>
        </div>
        <el-button :disabled="userMessage.trim() === '' || userMessage.trim().length > 500" class="send-btn"
          type="primary" @click="sendMessage">
          <el-icon>
            <Promotion />
          </el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MarkRender from '@/components/MarkRender.vue'
import dayjs from 'dayjs'
import { Plus, Promotion } from '@element-plus/icons-vue'
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatRound, Clock, DeleteFilled } from '@element-plus/icons-vue'
// 引入fetchEventSource库 用于接收服务器发送的事件流
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { startConsultation, getConsultationSessionList, deleteConsultationSession, getConsultationSessionDetail, getConsultationSessionEmotion } from '@/api/admin'
const imgURL = new URL('@/assets/images/robot-fill.png', import.meta.url).href

//定义一个当前会话对象
const currentSession = ref<any>({})
//定义对话消息, 包含用户和AI助手的消息,用于在聊天区回显
const chatMessages = ref<any>([])
//定义用户输入的消息
const userMessage = ref('')
//定义AI助手是否正在回答
const isAIAnswer = ref(false)
//定义分页参数
const pageNum = ref('1')
const pageSize = ref('10')
//定义会话列表
const sessionList = ref<any>([])
onMounted(() => {
  //获取会话列表
  getSessionPage()
  //新建会话
  createNewSession()
})

//定义情绪花园数据
const emotionGarden = ref<any>({
  primaryEmotion: '中性',
  emotionScore: 50,
  isNegative: false,
  riskLevel: 0,
  suggestion: '暂无建议，和我聊天试试',
  improvementSuggestions: ['暂无'],
  riskDescription: '暂无风险描述'
})

const loadEmotionGarden = async (sessionId: string) => {
  const id = sessionId.toString().startsWith("session_") ? sessionId : "session_" + sessionId
  const res = await getConsultationSessionEmotion(id)
  if (res.data.code === '200') {
    emotionGarden.value = res.data.data
    console.log(emotionGarden.value)
  } else {
    ElMessage.error(res.data.message)
  }
}

//情绪花园映射方法
const getIntensityClass = (i: number) => {
  if (i >= 61) {
    return 3;
  } else if (i >= 31) {
    return 2;
  } else {
    return 1;
  }
}

//情绪花园风险等级映射方法
const getRiskText = (i: number) => {
  switch (i) {
    case 0:
      return '正常';
    case 1:
      return '需要关注';
    case 2:
      return '预警';
    case 3:
      return '危机';
    default:
      return '正常';
  }
}

//处理换行逻辑
const formatMarkdown = (markdown: string) => {
  return markdown.replace(/\n/g, '<br>')
}

//新建会话
const createNewSession = () => {
  const newSession = {
    sessionId: 'temp_' + Date.now(),
    status: 'TEMP',
    sessionTitle: '新对话'
  }
  currentSession.value = newSession
  chatMessages.value = currentSession.value.chatMessages || []
}

//选择会话
const selectSession = async (item: any) => {
  currentSession.value = item
  await loadEmotionGarden(item.id)
  //获取会话详情
  const res = await getConsultationSessionDetail(item.id)
  if (res.data.code === '200') {
    chatMessages.value = res.data.data || []
    //更新当前对话数据
    const sessionData = {
      sessionId: "session_" + item.id,
      status: 'ACTIVE',
      sessionTitle: item.sessionTitle
    }
    currentSession.value = sessionData
  } else {
    ElMessage.error(res.data.message)
  }
}

//删除会话
const deleteSession = async (id: string) => {
  const res = await deleteConsultationSession(id)
  if (res.data.code === '200') {
    ElMessage.success('删除成功')
    getSessionPage()
    selectSession(sessionList.value[0])
  } else {
    ElMessage.error(res.data.message)
  }
}

//进度条滚动到最下面
const chatMessagesRef = ref<any>(null)
const scrollToBottom = () => {
  nextTick(() => {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  })
}

//发送消息
const sendMessage = async () => {
  if (!userMessage.value.trim()) return
  if (isAIAnswer.value) {
    ElMessage.warning('AI正在回答中，请稍后再发送')
    return
  }

  const message = userMessage.value.trim()
  userMessage.value = ''

  //如果没有会话或者是临时会话，则创建新会话
  if (currentSession.value.status === 'TEMP') {
    startNewConsultation(message)
  } else {
    //继续咨询
    chatMessages.value.push({
      id: Date.now(),
      senderType: 1,
      content: message,
      createdAt: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
    })
    //开始流式对话
    startStreamConsultation(currentSession.value.sessionId, message)
  }
}

//开始新会话
const startNewConsultation = async (message: string) => {
  //构建会话参数
  const sessionParams = {
    initialMessage: message,
    sessionTitle: ''
  }
  if (currentSession.value.sessionTitle === '新对话') {
    //如果是新对话，会话标题为当前时间
    sessionParams.sessionTitle = `AI心理助手 - ${dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')}`
  } else {
    //如果不是新对话，会话标题为当前会话标题
    sessionParams.sessionTitle = currentSession.value.sessionTitle
  }
  //调用开始咨询接口
  const res = await startConsultation(sessionParams)
  //将后端返回的数据转为前端会话格式
  const sessionData = {
    sessionId: res.data.data.sessionId,
    status: res.data.data.status,
    sessionTitle: sessionParams.sessionTitle
  }
  // 如果是临时对话，更新信息
  if (currentSession.value && currentSession.value.status === 'TEMP') {
    // 更新会话信息
    Object.assign(currentSession.value, sessionData)
  } else {
    // 否则创建新会话
    currentSession.value = sessionData
  }
  // 刷新会话列表
  getSessionPage()
  //添加初始用户消息
  chatMessages.value.push({
    id: Date.now(),
    senderType: 1,
    content: message,
    createdAt: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
  })
  //开始流式对话
  startStreamConsultation(currentSession.value.sessionId, message)
}

//开始流式对话方法
const startStreamConsultation = async (sessionId: string, userMessage: string) => {
  //防止重复发送消息
  if (isAIAnswer.value) {
    ElMessage.warning('AI正在回答中，请稍后再发送')
    return
  }
  isAIAnswer.value = true
  const aiMessage = {
    id: `ai_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    senderType: 2,
    content: '',
    createdAt: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')
  }
  //将AI助手添加到消息列表
  chatMessages.value.push(aiMessage)
  //滚动到最新消息
  scrollToBottom()
  //调用流式接口
  //创建一个取消控制器,js新增的api,终止fetch请求
  const controller = new AbortController()
  fetchEventSource("/api/psychological-chat/stream", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      "token": sessionStorage.getItem('token') || ''
    },
    body: JSON.stringify({
      sessionId,
      userMessage
    }),
    //添加取消信号
    signal: controller.signal,
    onopen: async (response) => {
      if (response.headers.get('Content-Type') !== 'text/event-stream') {
        ElMessage.error('服务器返回非流式响应错误')
      }
    },
    onmessage: (event) => {
      const res = event.data.trim()
      if (!res) return
      const eventName = event.event
      //当前会话的AI消息
      const aiMessage = chatMessages.value[chatMessages.value.length - 1]
      if (eventName === 'done') {
        isAIAnswer.value = false
        controller.abort()
        //开始情绪分析
        loadEmotionGarden(currentSession.value.sessionId)
        return
      } else {
        const payload = JSON.parse(res)
        if (String(payload.code) === '200' && payload.data && payload.data.content) {
          aiMessage.content += payload.data.content
          scrollToBottom()
        } else if (String(payload.code) !== '200') {
          handleError(payload.message || 'AI回复失败')
        }
      }
    },
    onerror: (error) => {
      handleError(error)
      throw new Error(error)
    },
    onclose: () => {
      //开始情绪分析
      loadEmotionGarden(currentSession.value.sessionId)
    }
  })
}

//处理错误
const handleError = (message: string) => {
  const aiMessage = chatMessages.value[chatMessages.value.length - 1]
  if (aiMessage) {
    aiMessage.content = 'AI助手回答失败，请稍后再试'
  }
  isAIAnswer.value = false
  ElMessage.error("AI助手回答失败，请稍后再试")
}

//获取会话列表
const getSessionPage = async () => {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value
  }
  const res = await getConsultationSessionList(params)
  if (res.data.code === '200') {
    sessionList.value = res.data.data.records
  } else {
    ElMessage.error(res.data.message)
  }
}

const keyUp = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && userMessage.value.trim() !== '' && !e.shiftKey) {
    e.preventDefault()
    startNewConsultation(userMessage.value)
    userMessage.value = ''
  }
}
</script>

<style scoped lang="scss">
.consultation-container {
  margin: 0 auto;
  width: 1200px;
  display: flex;
  gap: 20px;
  padding: 20px;

  .sidebar {
    width: 320px;

    .ai-assistant-info {
      margin-bottom: 20px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(251, 146, 60, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04);
      border: 1px solid rgba(251, 146, 60, 0.08);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      .breathing-circle {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        animation: breathing 4s ease-in-out infinite;
        box-shadow: 0 6px 24px rgba(251, 146, 60, 0.25);
        position: relative;
      }

      .assistant-name {
        font-size: 16px;
        font-weight: 700;
        background: linear-gradient(135deg, #fb923c, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        background-clip: text;
        margin: 0 0 12px;
      }

      .online-status {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #059669;
        font-size: 12px;
        font-weight: 600;

        .status-dot {
          width: 8px;
          height: 8px;
          background: #059669;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
          box-shadow: 0 0 8px rgba(5, 150, 105, 0.4);
        }
      }
    }

    .session-history {
      background: white;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      min-height: 250px;
      display: flex;
      flex-direction: column;

      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;

      }

      .session-list {
        overflow-y: auto;
        max-height: 200px;
        scrollbar-width: thin;
        scrollbar-color: rgba(64, 150, 255, 0.3) transparent;

        .session-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;

          &:hover {
            background: #f8f9ff;
            border-color: #e6f0ff;
          }

          &.active {
            background: #e6f0ff;
            border-color: #4096ff;
          }

          .session-info {
            flex: 1;

            .session-title {
              font-weight: 500;
              font-size: 14px;
              color: #333;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              .session-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 6px;

                .session-time {
                  font-size: 12px;
                  color: #999;
                }
              }

              .session-preview {
                width: 200px;
                font-size: 12px;
                color: #666;
                margin-bottom: 6px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .session-stats {
                display: flex;
                align-items: center;
                gap: 12px;

                span {
                  font-size: 12px;
                  color: #999;
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }

            .session-actions {
              position: absolute;
              top: 10px;
              right: 12px;
            }
          }
        }

        .no-sessions-text {
          text-align: center;
          font-size: 14px;
          color: #999;
        }
      }
    }

    .emotion-garden {
      background: linear-gradient(135deg, #fef9e7 0%, #fcf4e6 50%, #f6f0e8 100%);
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 20px;
      box-shadow: 0 8px 32px rgba(252, 244, 230, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
      min-height: 300px;

      .garden-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        position: relative;
        z-index: 2;

        .garden-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #8b4513;
        }
      }

      .emotion-info {
        margin: 0 auto;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.8);
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
        color: #fff;

        .emotion-name {
          font-size: 15px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 2px;
        }

        .emotion-score {
          font-size: 14px;
          font-weight: 700;
          opacity: 0.9;
        }
      }

      .warm-tips {
        text-align: center;
        margin-bottom: 16px;

        .emotion-status-text {
          margin-bottom: 12px;

          .status-label {
            font-size: 14px;
            color: #8b7355;
            margin-right: 8px;
          }

          .status-emotion {
            font-size: 16px;
            font-weight: 600;
            padding: 4px 12px;
            border-radius: 16px;
            display: inline-block;
          }
        }

        .emotion-intensity {
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          .intensity-dots {
            display: flex;
            gap: 4px;

            .dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #e0e0e0;
              transition: all 0.3s ease;

              &.active {
                background: linear-gradient(135deg, #ff9a9e, #fecfef);
                transform: scale(1.2);
                box-shadow: 0 2px 8px rgba(255, 154, 158, 0.4);
              }
            }
          }

          .intensity-text {
            font-size: 12px;
            color: #8b7355;
            font-weight: 500;
          }
        }

        .warm-suggestion {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8));
          border-radius: 16px;
          padding: 12px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);

          .suggestion-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .suggestion-content {
            text-align: left;
            flex: 1;

            .suggestion-title {
              font-size: 14px;
              font-weight: 600;
              color: #8b7355;
              margin-bottom: 6px;
            }

            .suggestion-text {
              font-size: 13px;
              color: #6b5b47;
              line-height: 1.5;
            }
          }
        }

        .healing-actions {
          margin-bottom: 16px;

          .actions-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #8b7355;
            margin-bottom: 16px;
          }

          .actions-list {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .action-item {
              background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
              border-radius: 12px;
              padding: 12px;
              display: flex;
              align-items: center;
              gap: 10px;
              border: 1px solid rgba(255, 255, 255, 0.5);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
              text-align: left;

              .action-icon {
                font-size: 14px;
                color: #ffd700;
                flex-shrink: 0;
              }

              .action-text {
                font-size: 12px;
                color: #6b5b47;
                line-height: 1.4;
                flex: 1;
              }
            }
          }
        }

        .risk-notice {
          background: linear-gradient(135deg, #fff9e6, #ffeaa7);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid rgba(255, 234, 167, 0.6);
          box-shadow: 0 6px 20px rgba(255, 234, 167, 0.3);

          .notice-icon {
            font-size: 20px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          .notice-content {
            flex: 1;

            .notice-title {
              font-size: 14px;
              font-weight: 600;
              color: #d4840f;
              margin-bottom: 6px;
            }

            .notice-text {
              font-size: 13px;
              color: #b8740c;
              line-height: 1.5;
            }
          }
        }
      }
    }
  }

  .chat-main {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 252, 250, 0.98) 100%);
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(251, 146, 60, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(251, 146, 60, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex: 1;

    .chat-header {
      background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%);
      color: white;
      padding: 20px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      flex-shrink: 0;

      .header-left {
        display: flex;
        align-items: center;

        .chat-avatar {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          z-index: 1;
        }

        .chat-info {
          h2 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }

          p {
            font-size: 14px;
          }
        }
      }
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 252, 248, 0.05) 100%);
      min-height: 0;
      max-height: calc(100vh - 200px);
      scrollbar-width: thin;
      scrollbar-color: rgba(251, 146, 60, 0.3) transparent;
      overflow-y: scroll;

      .message-item {
        display: flex;
        align-items: center;
        gap: 12px;

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }

        &.ai-message {
          .message-avatar {
            background: linear-gradient(135deg, #fb923c, #f59e0b);
            box-shadow: 0 4px 12px rgba(251, 146, 60, 0.3);
            margin-bottom: 18px;
          }
        }

        &.user-message {
          .message-avatar {
            background: linear-gradient(135deg, #6b7280, #4b5563);
            box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
            margin-bottom: 18px;
          }
        }

        .message-content {
          max-width: 70%;

          .message-bubble {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 252, 248, 0.95) 100%);
            border-radius: 16px;
            padding: 12px 16px;
            position: relative;
            animation: fadeInUp 0.4s ease-out;
            border: 1px solid rgba(251, 146, 60, 0.1);
            box-shadow: 0 4px 16px rgba(251, 146, 60, 0.05);

            .typing-indicator {
              display: flex;
              gap: 4px;
              padding: 8px 0;

              .typing-dot {
                width: 8px;
                height: 8px;
                background: #ccc;
                border-radius: 50%;
                animation: typing 1.5s ease-in-out infinite;

                &:nth-child(2) {
                  animation-delay: 0.2s;
                }

                &:nth-child(3) {
                  animation-delay: 0.4s;
                }
              }
            }

            /* 错误消息样式 */
            .error-message {
              background: linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%);
              border: 1px solid #F87171;
              border-radius: 12px;
              padding: 12px 16px;
              color: #991B1B;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 8px;
            }
          }

          .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 4px;
          }
        }
      }
    }

    .chat-input {
      border-top: 1px solid rgba(251, 146, 60, 0.1);
      padding: 20px 24px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 252, 248, 0.7) 100%);
      backdrop-filter: blur(10px);
      flex-shrink: 0;

      .input-container {
        flex: 1;
      }

      .input-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: #78716c;
        font-weight: 500;
      }

      .send-btn {
        height: 60px;
        width: 60px;
        margin-bottom: 25px;
        border-radius: 16px;
        background: linear-gradient(135deg, #fb923c 0%, #f59e0b 100%) !important;
        border: none !important;
        box-shadow: 0 6px 20px rgba(251, 146, 60, 0.25);
        transition: all 0.3s ease;
      }

    }

  }
}
</style>