import request from '@/utils/request'

// 登录接口
export const login = (data: { username: string, password: string }) => {
  return request.post('/user/login', data)
}

// 获取分类树接口
export const getCategoryTree = () => {
  return request.get('/knowledge/category/tree')
}

// 获取文章列表接口
export const getArticleList = (params: { currentPage?: string, size?: string, categoryId?: string, title?: string, status?: string, authorName?: string }) => {
  return request.get('/knowledge/article/page', { params })
}

//文件上传
export const uploadFilePart = (file: File, businessInfo: { businessId: string }) => {
  // 构建 FormData 对象
  const formData = new FormData()
  // 添加文件
  formData.append('file', file)
  // 添加业务信息
  formData.append('businessType', 'ARTICLE')
  formData.append('businessId', businessInfo.businessId)
  formData.append('businessField', 'cover')
  return request.post('/file/upload', formData)
}

// 文章新增接口
export const addArticle = (data: { title: string, content: string, coverImage: string, categoryId: number, summary: string }) => {
  return request.post('/knowledge/article', data)
}

//获取文章详情
export const getArticleDetail = (id: string) => {
  return request.get(`/knowledge/article/${id}`)
}

//文章修改接口
export const updateArticle = (id: string, data: { title: string, content: string, coverImage: string, categoryId: number, summary: string }) => {
  return request.put(`/knowledge/article/${id}`, data)
}

//更新文章状态
export const updateArticleStatus = (id: string, status: number) => {
  return request.put(`/knowledge/article/${id}/status`, { status })
}

//删除文章
export const deleteArticle = (id: string) => {
  return request.delete(`/knowledge/article/${id}`)
}

//获取分页咨询记录列表
export const getConsultationList = (params: { currentPage?: string, size?: string, emotionTag?: string }) => {
  return request.get('/psychological-chat/sessions', { params })
}

//获取咨询记录详情
export const getConsultationDetail = (sessionId: string) => {
  return request.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

//获取分页情绪日志列表
export const getEmotionDiaryList = (params: { currentPage?: string, size?: string | number, userId?: string, minMoodScore?: string, maxMoodScore?: string, dominantEmotion?: string }) => {
  return request.get('/emotion-diary/admin/page', { params })
}

//删除情绪日志
export const deleteEmotionDiary = (id: string) => {
  return request.delete(`/emotion-diary/admin/${id}`)
}

//获取综合数据
export const getSummary = () => {
  return request.get('/data-analytics/overview')
}

//退出登录
export const logout = () => {
  return request.post('/user/logout')
}

//用户注册
export const register = (data: { username: string, email: string, nickname: string, phone: string, password: string, confirmPassword: string, gender: number, userType: number }) => {
  return request.post('/user/add', data)
}

//开始咨询
export const startConsultation = (data: { initialMessage: string, sessionTitle: string }) => {
  return request.post('/psychological-chat/session/start', data)
}

//分页查询咨询回话
export const getConsultationSessionList = (params: { pageNum: string, pageSize: string }) => {
  return request.get('/psychological-chat/sessions', { params })
}

//删除咨询回话
export const deleteConsultationSession = (sessionId: string) => {
  return request.delete(`/psychological-chat/sessions/${sessionId}`)
}

//获取咨询回话详情
export const getConsultationSessionDetail = (sessionId: string) => {
  return request.get(`/psychological-chat/sessions/${sessionId}/messages`)
}

//获取咨询回话情绪分析
export const getConsultationSessionEmotion = (sessionId: string) => {
  return request.get(`/psychological-chat/session/${sessionId}/emotion`)
}

//提交情绪日志
export const submitEmotionDiary = (data: { diaryDate: string, moodScore: number, dominantEmotion: string, emotionTriggers: string, diaryContent: string, sleepQuality: number | string, stressLevel: number | string }) => {
  return request.post('/emotion-diary', data)
}

//获取分页推荐文章列表
export const getRecommendArticleList = (params: { sortField: string, sortDirection: string, currentPage: string, size: string }) => {
  return request.get('/knowledge/article/page', { params })
}

//获取推荐文章详情
export const getRecommendArticleDetail = (id: string) => {
  return request.get(`/knowledge/article/${id}`)
}