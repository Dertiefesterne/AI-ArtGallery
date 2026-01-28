import { configureStore, createSlice } from '@reduxjs/toolkit'
// import { setupListeners } from '@reduxjs/toolkit/query'

// 临时 reducer - 后续会添加真正的 slices
const tempSlice = createSlice({
  name: 'temp',
  initialState: { value: 0 },
  reducers: {
    increment: state => {
      state.value += 1
    },
  },
})

// 这里后续会添加 slices 和 API
// import { artGalleryApi } from './services/artGalleryApi'
// import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    temp: tempSlice.reducer,
    // 这里后续会添加 reducers
    // artGalleryApi: artGalleryApi.reducer,
    // ui: uiReducer,
  },
  // 开发环境启用 Redux DevTools
  devTools: import.meta.env.DEV,
  // 添加中间件
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // 后续添加 RTK Query 中间件
      // serializableCheck: false, // 如果需要可以禁用序列化检查
    })
      .concat
      // 后续添加 RTK Query 中间件
      // artGalleryApi.middleware,
      (),
})

// 启用 RTK Query 的自动重新获取（后续添加 RTK Query API 时启用）
// setupListeners(store.dispatch())

// 导出类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
