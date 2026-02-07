import { configureStore } from '@reduxjs/toolkit'
import imageReducer from './imageSlice'

export const store = configureStore({
  reducer: {
    images: imageReducer,
  },
  // 开发环境启用 Redux DevTools
  devTools: import.meta.env.DEV,
})

// 启用 RTK Query 的自动重新获取（后续添加 RTK Query API 时启用）
// setupListeners(store.dispatch())

// 导出类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
