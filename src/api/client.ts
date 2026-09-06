import axios from 'axios'
import { store } from '../stores/store'
import { logout } from '../stores/authSlice'

// 后端地址用 .env.local 的 VITE_API_BASE 覆盖
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// 请求拦截：自动带上 token
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：401 清掉登录态（localStorage + Redux）
client.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('auth_user')
      store.dispatch(logout())
    }
    return Promise.reject(err)
  }
)

export default client
