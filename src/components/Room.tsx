import { useRef } from 'react'
import { Mesh } from 'three'

/**
 * 画廊房间组件 - 竖直走廊
 *
 * 设计：
 * - 竖直走廊结构
 * - 尺寸：12米宽 × 20米长 × 8米高
 * - 两侧墙面：左墙（X=-6）和右墙（X=6）
 * - 走廊尽头：一面墙（Z=-10）
 */
export function Room() {
  const wallMaterial = (
    <meshStandardMaterial
      color="#f5f5dc" // 米白色墙面
      roughness={0.8}
      metalness={0.1}
    />
  )

  const floorMaterial = (
    <meshStandardMaterial
      color="#8b7355" // 木地板颜色
      roughness={0.6}
      metalness={0}
    />
  )

  const ceilingMaterial = (
    <meshStandardMaterial
      color="#fafafa" // 白色天花板
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
