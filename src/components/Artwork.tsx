import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { Html } from '@react-three/drei'

interface ArtworkProps {
  position: [number, number, number]
  rotation: [number, number, number]
  imageUrl?: string
  prompt?: string
  styleLabel?: string
  onClick?: () => void
}

export function Artwork({ position, rotation, imageUrl, prompt, styleLabel, onClick }: ArtworkProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null)
      return
    }

    const loader = new TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(
      imageUrl,
      loadedTexture => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace
        setTexture(loadedTexture)
      },
      undefined,
      error => {
        console.error('[Artwork] 纹理加载失败:', error)
        setTexture(null)
      }
    )
  }, [imageUrl])

  const frameMaterial = <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.8} />

  const trimMaterial = <meshStandardMaterial color="#f4d03f" roughness={0.2} metalness={0.9} />

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {/* 金色外框 */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 2.1, 0.08]} />
        {frameMaterial}
      </mesh>

      {/* 内侧金色装饰 */}
      <mesh position={[0, 0, 0.06]} castShadow>
        <boxGeometry args={[1.5, 2, 0.04]} />
        {trimMaterial}
      </mesh>

      {/* 黑色背景 */}
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[1.4, 1.9]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>

      {/* 图片区域 */}
      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[1.3, 1.8, 0.01]} />
        {texture ? (
          <meshBasicMaterial map={texture} color="#ffffff" />
        ) : (
          <meshStandardMaterial color="#4a5568" roughness={0.8} />
        )}
      </mesh>

      {/* 顶部装饰 */}
      <mesh position={[0, 1.05, 0.09]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.02]} />
        {trimMaterial}
      </mesh>

      {/* 底部装饰 */}
      <mesh position={[0, -1.05, 0.09]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.02]} />
        {trimMaterial}
      </mesh>

      {/* 左装饰 */}
      <mesh position={[0.75, 0, 0.09]} castShadow>
        <boxGeometry args={[0.05, 0.3, 0.02]} />
        {trimMaterial}
      </mesh>
      <mesh position={[-0.75, 0, 0.09]} castShadow>
        <boxGeometry args={[0.05, 0.3, 0.02]} />
        {trimMaterial}
      </mesh>

      {/* 四角装饰 */}
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

      {/* 悬停提示 */}
      {isHovered && (prompt || styleLabel) && (
        <Html position={[0, 2.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className="artwork-tooltip">
            {styleLabel && <span className="artwork-tooltip-style">{styleLabel}</span>}
            {prompt && <span className="artwork-tooltip-prompt">{prompt.slice(0, 30)}{prompt.length > 30 ? '...' : ''}</span>}
          </div>
        </Html>
      )}
    </group>
  )
}
