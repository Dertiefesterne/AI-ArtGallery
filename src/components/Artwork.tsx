import { useRef, useState } from 'react'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

interface ArtworkProps {
  position: [number, number, number]
  rotation: [number, number, number]
  imageUrl?: string  // 可选的图片 URL
}

/**
 * 艺术作品组件
 *
 * 设计：
 * - 古典欧式金色画框
 * - 画框尺寸：高2米，宽1.5米
 * - 画框宽度：8cm
 * - 画框带有装饰性纹理
 * - 画作内容：支持动态图片或占位色块
 */
export function Artwork({ position, rotation, imageUrl }: ArtworkProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [textureError, setTextureError] = useState(false)

  // 加载纹理
  let texture = null
  try {
    if (imageUrl && !textureError) {
      texture = useTexture(imageUrl)
    }
  } catch (error) {
    setTextureError(true)
  }

  // 画框材质 - 古典金色
  const frameMaterial = (
    <meshStandardMaterial
      color="#d4af37" // 金色
      roughness={0.3}
      metalness={0.8}
    />
  )

  // 画框装饰条材质 - 稍浅的金色
  const trimMaterial = (
    <meshStandardMaterial
      color="#f4d03f"
      roughness={0.2}
      metalness={0.9}
    />
  )

  // 画布材质
  const canvasMaterial = (
    <meshStandardMaterial
      color="#ffffff"
      roughness={1}
      metalness={0}
    />
  )

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* 外框 - 金色宽框 */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 2.1, 0.08]} />
        {frameMaterial}
      </mesh>

      {/* 内框装饰条 - 稍窄的金框 */}
      <mesh position={[0, 0, 0.06]} castShadow>
        <boxGeometry args={[1.5, 2, 0.04]} />
        {trimMaterial}
      </mesh>

      {/* 画布 - 白色背景 */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[1.4, 1.9]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>

      {/* 占位画作内容 */}
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[1.3, 1.8, 0.03]} />
        {texture && !textureError ? (
          <meshStandardMaterial
            map={texture}
            roughness={0.8}
          />
        ) : (
          <meshStandardMaterial
            color="#4a5568"
            roughness={0.8}
            polygonOffset={true}
            polygonOffsetFactor={1}
            polygonOffsetUnits={1}
          />
        )}
      </mesh>

      {/* 画框顶部装饰 */}
      <mesh position={[0, 1.05, 0.09]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.02]} />
        {trimMaterial}
      </mesh>

      {/* 画框底部装饰 */}
      <mesh position={[0, -1.05, 0.09]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.02]} />
        {trimMaterial}
      </mesh>

      {/* 画框左右装饰 */}
      <mesh position={[0.75, 0, 0.09]} castShadow>
        <boxGeometry args={[0.05, 0.3, 0.02]} />
        {trimMaterial}
      </mesh>
      <mesh position={[-0.75, 0, 0.09]} castShadow>
        <boxGeometry args={[0.05, 0.3, 0.02]} />
        {trimMaterial}
      </mesh>

      {/* 画框四角装饰 - 金色角花 */}
      <mesh position={[0.7, 0.95, 0.09]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        {trimMaterial}
      </mesh>
      <mesh position={[-0.7, 0.95, 0.09]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        {trimMaterial}
      </mesh>
      <mesh position={[0.7, -0.95, 0.09]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        {trimMaterial}
      </mesh>
      <mesh position={[-0.7, -0.95, 0.09]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        {trimMaterial}
      </mesh>
    </group>
  )
}
