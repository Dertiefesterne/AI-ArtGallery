/**
 * FPS 监控组件
 *
 * 功能：
 * - 开发环境显示实时帧率
 * - 显示 FPS、MS（帧时间）、MB（内存占用）
 * - 符合项目宪法要求：开发环境必须显示 FPS 监控
 */

import { useEffect, useRef } from 'react'
import Stats from 'stats.js'

interface StatsProps {
  showFps?: boolean
  showMs?: boolean
  showMb?: boolean
}

/**
 * FPS 监控组件
 * 仅在开发环境显示
 */
export function PerformanceStats({ showFps = true, showMs = false, showMb = false }: StatsProps) {
  const statsRef = useRef<Stats | null>(null)

  useEffect(() => {
    // 生产环境不显示
    if (import.meta.env.PROD) {
      return
    }

    const stats = new Stats()
    statsRef.current = stats

    // 配置显示面板
    if (showFps) stats.showPanel(0)
    if (showMs) stats.showPanel(1)
    if (showMb) stats.showPanel(2)

    // 设置样式
    stats.dom.style.position = 'fixed'
    stats.dom.style.top = '10px'
    stats.dom.style.left = '10px'
    stats.dom.style.zIndex = '9999'

    document.body.appendChild(stats.dom)

    // 动画循环
    const animate = () => {
      stats.begin()
      stats.end()
      requestAnimationFrame(animate)
    }
    const animationId = requestAnimationFrame(animate)

    // 清理
    return () => {
      cancelAnimationFrame(animationId)
      if (stats.dom && stats.dom.parentNode) {
        stats.dom.parentNode.removeChild(stats.dom)
      }
    }
  }, [showFps, showMs, showMb])

  return null
}
