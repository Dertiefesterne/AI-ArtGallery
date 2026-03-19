import { useState, useCallback } from 'react'

/**
 * 相机视角预设
 */
export interface CameraView {
  position: [number, number, number]
  target: [number, number, number]
  id: number // 用于触发动画的唯一标识
}

/**
 * 预设视角配置（不含 id）
 */
const CAMERA_PRESET_CONFIGS = {
  // 默认视角 - 入口处，面向走廊尽头
  default: {
    position: [0, 1.6, 12] as [number, number, number],
    target: [0, 3, -10] as [number, number, number],
  },
  // 俯视图 - 从上方俯瞰整个画廊
  top: {
    position: [0, 15, 0] as [number, number, number],
    target: [0, 0, 0] as [number, number, number],
  },
  // 侧视图 - 从右侧观察画廊
  side: {
    position: [15, 4, 0] as [number, number, number],
    target: [0, 3, 0] as [number, number, number],
  },
}

/**
 * 带有 id 的预设视角
 */
export const CAMERA_PRESETS: Record<string, Omit<CameraView, 'id'>> = CAMERA_PRESET_CONFIGS

/**
 * 相机控制 Hook
 *
 * 功能：
 * - 管理当前视角状态
 * - 提供视角切换方法
 * - 支持平滑过渡动画
 * - 每次点击都会触发动画（通过递增 id）
 */
export function useCameraControl() {
  const [currentView, setCurrentView] = useState<CameraView>(() => ({
    ...CAMERA_PRESET_CONFIGS.default,
    id: 0, // 初始化时 id 为 0，不触发动画
  }))

  /**
   * 切换到指定视角（每次调用都会触发动画）
   */
  const setView = useCallback((viewName: keyof typeof CAMERA_PRESET_CONFIGS) => {
    const config = CAMERA_PRESET_CONFIGS[viewName]
    if (config) {
      setCurrentView({
        ...config,
        id: Date.now(), // 使用时间戳确保每次都是唯一值
      })
    }
  }, [])

  /**
   * 重置视角到默认位置
   */
  const resetView = useCallback(() => {
    setView('default')
  }, [setView])

  /**
   * 切换到俯视图
   */
  const setTopView = useCallback(() => {
    setView('top')
  }, [setView])

  /**
   * 切换到侧视图
   */
  const setSideView = useCallback(() => {
    setView('side')
  }, [setView])

  return {
    currentView,
    setView,
    resetView,
    setTopView,
    setSideView,
  }
}

/**
 * 视角类型
 */
export type CameraViewType = keyof typeof CAMERA_PRESET_CONFIGS
