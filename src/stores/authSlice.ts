import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '@/api/auth'

interface AuthState {
  user: AuthUser | null
  token: string | null
}

// 初始化时从 localStorage 恢复（刷新不丢登录态）
const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
  token: localStorage.getItem('token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user))
    },
    logout: state => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('auth_user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsLoggedIn = (state: { auth: AuthState }) => !!state.auth.token
