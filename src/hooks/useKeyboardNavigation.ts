import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * 键盘导航配置
 */
export interface KeyboardConfig {
  /** 移动速度 */
  moveSpeed: number
  /** 旋转速度（度/秒） */
  rotationSpeed: number
  /** 是否启用碰撞检测 */
  enableCollision: boolean
  /** 碰撞边界（用于限制相机移动范围） */
  collisionBounds: THREE.Box3
  /** 是否启用脚步声 */
  enableFootstep: boolean
  /** 脚步声音文件路径 */
  footstepSound?: string
}

/**
 * 键盘导航 Hook
 * 提供键盘状态追踪功能
 *
 * @param config 配置选项（可选）
 * @returns 键盘状态和控制方法
 */
export function useKeyboardNavigation(_config?: Partial<KeyboardConfig>) {
  const keysPressed = useRef<Set<string>>(new Set())

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current.add(event.code)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.current.delete(event.code)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return {
    keysPressed: keysPressed.current,
  }
}
