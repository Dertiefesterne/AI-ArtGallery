/**
 * 图片生成业务逻辑 Hook
 */

import { useDispatch, useSelector } from 'react-redux'
import { useCallback } from 'react'
import { nanoid } from 'nanoid'
import type { AppDispatch, RootState } from '@/stores/store'
import type { GenerationParams, ImageGeneration } from '@/types/image'
import {
  addToHistory,
  updateTask,
  deleteTask,
  generateImageAsync,
} from '@/stores/imageSlice'

/**
 * 使用类型化的 hooks
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector)

/**
 * 图片生成 Hook
 */
export function useImageGeneration() {
  const dispatch = useAppDispatch()

  // 获取队列和历史记录
  const queue = useAppSelector((state) =>
    state.images.history.filter(
      (t) => t.status === 'pending' || t.status === 'generating'
    )
  )
  const history = useAppSelector((state) => state.images.history)

  /**
   * 提交生成任务
   */
  const submitGeneration = useCallback(
    (params: GenerationParams) => {
      const id = nanoid()

      // 创建新任务
      const newTask: ImageGeneration = {
        id,
        prompt: params.prompt,
        style: params.style,
        styleLabel: params.styleLabel,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toLocaleString('zh-CN'),
        queuePosition: queue.length + 1,
      }

      // 添加到历史记录
      dispatch(addToHistory(newTask))

      // 异步调用 API
      dispatch(generateImageAsync({ ...params, id }))

      // 模拟进度更新（因为 API 可能不返回实时进度）
      simulateProgress(id)
    },
    [dispatch, queue.length]
  )

  /**
   * 模拟进度更新
   */
  const simulateProgress = useCallback((id: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10 + 5 // 随机增加 5-15%

      if (progress >= 95) {
        clearInterval(interval)
        progress = 95 // 等待 API 返回，最多到 95%
      }

      dispatch(updateTask({ id, progress }))
    }, 500)
  }, [dispatch])

  /**
   * 取消任务
   */
  const cancelGeneration = useCallback((id: string) => {
    dispatch(deleteTask(id))
  }, [dispatch])

  /**
   * 删除任务
   */
  const deleteGeneration = useCallback((id: string) => {
    dispatch(deleteTask(id))
  }, [dispatch])

  /**
   * 清空历史
   */
  const clearHistory = useCallback(() => {
    dispatch(clearHistory())
  }, [dispatch])

  return {
    queue,
    history,
    submitGeneration,
    cancelGeneration,
    deleteGeneration,
    clearHistory,
  }
}
