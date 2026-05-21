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

// 画框内框尺寸
const FRAME_INNER_WIDTH = 1.3
const FRAME_INNER_HEIGHT = 1.8

export function Artwork({ position, rotation, imageUrl, prompt, styleLabel, onClick }: ArtworkProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [imageAspect, setImageAspect] = useState<number>(1)

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
        // 设置贴图参数：裁剪而非压缩
        loadedTexture.wrapS = THREE.ClampToEdgeWrapping
        loadedTexture.wrapT = THREE.ClampToEdgeWrapping
        loadedTexture.minFilter = THREE.LinearFilter
        loadedTexture.magFilter = THREE.LinearFilter
        setTexture(loadedTexture)

        // 获取图片原始比例
        const img = loadedTexture.image
        if (img && img.naturalWidth) {
          setImageAspect(img.naturalWidth / img.naturalHeight)
        }
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

  // 计算贴图变换：确保图片铺满画框，裁剪多余部分
  const frameAspect = FRAME_INNER_WIDTH / FRAME_INNER_HEIGHT
  const textureOffset = [0, 0]
  const textureRepeat = [1, 1]

  if (imageAspect > frameAspect) {
    // 图片比画框宽：裁剪左右两边
    const scale = imageAspect / frameAspect
    textureRepeat[0] = 1 / scale
    textureOffset[0] = (1 - textureRepeat[0]) / 2
  } else {
    // 图片比画框高：裁剪上下
    const scale = frameAspect / imageAspect
    textureRepeat[1] = 1 / scale
    textureOffset[1] = (1 - textureRepeat[1]) / 2
  }

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

      {/* 图片区域 - 使用 planeGeometry */}
      <mesh position={[0, 0, 0.115]}>
        <planeGeometry args={[FRAME_INNER_WIDTH, FRAME_INNER_HEIGHT]} />
        {texture ? (
          <meshBasicMaterial
            map={texture}
            onUpdate={self => {
              if (self.map) {
                self.map.offset.set(textureOffset[0], textureOffset[1])
                self.map.repeat.set(textureRepeat[0], textureRepeat[1])
                self.map.needsUpdate = true
              }
            }}
          />
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
            {prompt && <span className="artwork-tooltip-prompt">《{prompt}》</span>}
          </div>
        </Html>
      )}
    </group>
  )
}
