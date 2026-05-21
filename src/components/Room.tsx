// Room 组件 - 画廊房间

/**
 * 画廊房间组件 - 竖直走廊
 *
 * 设计：
 * - 竖直走廊结构
 * - 尺寸：12米宽 × 20米长 × 8米高
 * - 两侧墙面：左墙（X=-6）和右墙（X=6）
 * - 走廊尽头：一面墙（Z=-10）
 */
import { useMemo } from 'react'
import * as THREE from 'three'

// 创建程序化木纹纹理
function createWoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // 填充底色 - 深胡桃木色
  ctx.fillStyle = '#5c4033'
  ctx.fillRect(0, 0, 512, 512)

  // 绘制木纹线条 - 简约风格
  for (let i = 0; i < 8; i++) {
    const darkness = Math.random() * 0.15 + 0.15
    ctx.strokeStyle = `rgba(50, 30, 10, ${darkness})`
    ctx.lineWidth = Math.random() * 4 + 2

    const y = Math.random() * 512
    ctx.beginPath()
    ctx.moveTo(0, y)

    // 平缓的波浪线
    for (let x = 0; x < 512; x += 8) {
      const waveY = y + Math.sin(x * 0.015) * 8
      ctx.lineTo(x, waveY)
    }
    ctx.stroke()
  }

  // 添加少量年轮效果
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const radius = Math.random() * 50 + 30

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, 'rgba(40, 25, 10, 0.25)')
    gradient.addColorStop(0.6, 'rgba(60, 35, 15, 0.1)')
    gradient.addColorStop(1, 'rgba(60, 35, 15, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(x, y, radius, radius * 0.5, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  // 添加少量瑕疵
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = `rgba(40, 25, 10, ${Math.random() * 0.06})`
    const x = Math.random() * 512
    const y = Math.random() * 512
    const size = Math.random() * 1 + 0.5
    ctx.fillRect(x, y, size, size)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  // 12米宽 ÷ 1米砖宽 = 12块, 20米长 ÷ 1米砖长 = 20块
  texture.repeat.set(12, 20)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function Room() {
  const wallMaterial = (
    <meshStandardMaterial
      color="#e8e4df" // 象牙白墙面
      roughness={0.8}
      metalness={0.1}
    />
  )

  // 木纹地板材质
  const floorTexture = useMemo(() => createWoodTexture(), [])

  const floorMaterial = (
    <meshStandardMaterial
      map={floorTexture}
      roughness={0.7}
      metalness={0}
    />
  )

  const ceilingMaterial = (
    <meshStandardMaterial
      color="#f8f6f3" // 暖白色天花板
      roughness={1}
      metalness={0}
    />
  )

  return (
    <group>
      {/* 地板 - 12×20 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 20]} />
        {floorMaterial}
      </mesh>

      {/* 天花板 - 12×20 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 0]}>
        <planeGeometry args={[12, 20]} />
        {ceilingMaterial}
      </mesh>

      {/* 左墙 - X=-6 */}
      <mesh position={[-6, 4, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, 8, 20]} />
        {wallMaterial}
      </mesh>

      {/* 右墙 - X=6 */}
      <mesh position={[6, 4, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.3, 8, 20]} />
        {wallMaterial}
      </mesh>

      {/* 走廊尽头墙 - Z=-10 */}
      <mesh position={[0, 4, -10]} receiveShadow castShadow>
        <boxGeometry args={[12, 8, 0.3]} />
        {wallMaterial}
      </mesh>
    </group>
  )
}
