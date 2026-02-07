/**
 * 图片生成状态管理 Slice
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import type { ImageGeneration, GenerationParams } from '@/types/image'
import { generateImage } from '@/services/imageGen'

/**
 * 异步 Thunk：生成图片
 */
export const generateImageAsync = createAsyncThunk(
  'images/generate',
  async (params: GenerationParams, { rejectWithValue }) => {
    try {
      const startTime = Date.now()
      const imageUrl = await generateImage(params.prompt, params.style)
      const duration = Math.round((Date.now() - startTime) / 1000)

      return { imageUrl, duration }
    } catch (error) {
      const message = error instanceof Error ? error.message : '生成失败'
      return rejectWithValue(message)
    }
  }
)

/**
 * 状态类型
 */
interface ImageState {
  history: ImageGeneration[]  // 所有任务历史
}

/**
 * 初始状态
 */
const initialState: ImageState = {
  history: [],
}

/**
 * Image Slice
 */
const imageSlice = createSlice({
  name: 'images',
  initialState,

  reducers: {
    /**
     * 添加到历史记录（初始状态为 pending）
     */
    addToHistory: (state, action: PayloadAction<ImageGeneration>) => {
      state.history.unshift(action.payload) // 添加到开头
    },

    /**
     * 更新任务状态和进度
     */
    updateTask: (
      state,
      action: PayloadAction<{
        id: string
        status?: ImageGeneration['status']
        progress?: number
      }>
    ) => {
      const { id, status, progress } = action.payload
      const task = state.history.find((t) => t.id === id)

      if (task) {
        if (status) task.status = status
        if (progress !== undefined) task.progress = progress
      }
    },

    /**
     * 删除任务
     */
    deleteTask: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter((t) => t.id !== action.payload)
    },

    /**
     * 清空历史
     */
    clearHistory: (state) => {
      state.history = []
    },
  },

  extraReducers: (builder) => {
    builder
      // 生成开始
      .addCase(generateImageAsync.pending, (state, action) => {
        const task = state.history.find((t) => t.id === action.meta.arg.id)
        if (task) {
          task.status = 'generating'
          task.progress = 0
        }
      })
      // 生成成功
      .addCase(generateImageAsync.fulfilled, (state, action) => {
        const task = state.history.find((t) => t.id === action.meta.arg.id)
        if (task) {
          task.status = 'success'
          task.progress = 100
          task.imageUrl = action.payload.imageUrl
          task.duration = action.payload.duration
        }
      })
      // 生成失败
      .addCase(generateImageAsync.rejected, (state, action) => {
        const task = state.history.find((t) => t.id === action.meta.arg.id)
        if (task) {
          task.status = 'failed'
          task.error = action.payload as string
        }
      })
  },
})

/**
 * 导出 Actions
 */
export const { addToHistory, updateTask, deleteTask, clearHistory } =
  imageSlice.actions

/**
 * 导出 Reducer
 */
export default imageSlice.reducer

/**
 * 导出 Selectors
 */
export const selectHistory = (state: { images: ImageState }) =>
  state.images.history

export const selectQueue = (state: { images: ImageState }) =>
  state.images.history.filter(
    (t) => t.status === 'pending' || t.status === 'generating'
  )

export const selectCompletedTasks = (state: { images: ImageState }) =>
  state.images.history.filter(
    (t) => t.status === 'success' || t.status === 'failed'
  )
