import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})
// 添加请求拦截器
request.interceptors.request.use(async (config) => {
  // 在发送请求之前添加token
  const token = localStorage.getItem('token')
  if (token) {
    // 如果有token，就添加到请求头中
    config.headers['token'] = token
  }
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
request.interceptors.response.use((response) => {
  // 2xx 范围内的状态码都会触发该函数。
  // 对响应数据做点什么
  if (response.data.code === '200') {
    // 如果是成功，就返回数据
    return response
  } 
  if (response.data.code === '-1') {
    if (response.config.url?.includes('/login')) {
      ElMessage.error(response.data.msg || '登录过期，请重新登录')
      // 清除token
      localStorage.removeItem('token')
      // 清除用户信息
      localStorage.removeItem('userInfo')
      window.location.href = '/auth/login'
    }
    return Promise.reject(response.data)
  } 
    ElMessage.error(response.data.msg || '请求失败')
    return Promise.reject("请求失败...")
  }, (error) => {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  return Promise.reject(error);
});

export default request