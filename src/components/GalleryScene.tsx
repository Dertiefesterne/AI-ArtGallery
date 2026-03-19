import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useSelector } from 'react-redux'
import * as THREE from 'three'
import { Room } from './Room'
import { Artwork } from './Artwork'
import type { RootState } from '@/stores/store'
import type { CameraView } from '@/hooks/useCameraControl'

interface GallerySceneProps {
  currentView?: CameraView
}

/**
 * 相机动画控制器组件
 * 只在视角变化时执行平滑过渡，之后允许用户自由控制
 */
function CameraAnimator({ targetView }: { targetView: CameraView }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  // 动画状态
  const [isAnimating, setIsAnimating] = useState(false)
  const animationProgress = useRef(0)

  // 起始和目标位置
  const startPosition = useRef(new THREE.Vector3())
  const startTarget = useRef(new THREE.Vector3())
  const targetPosition = useRef(new THREE.Vector3(...targetView.position))
  const targetLookAt = useRef(new THREE.Vector3(...targetView.target))

  // 记录上一次的视角 id，用于检测变化
  const lastViewIdRef = useRef<number>(-1)

  // 标记是否已完成首次初始化
  const isInitializedRef = useRef(false)

  // 当视角变化时，启动动画
  useEffect(() => {
    if (lastViewIdRef.current !== targetView.id) {
      const isFirstRender = lastViewIdRef.current === -1

      lastViewIdRef.current = targetView.id

      // 更新目标位置
      targetPosition.current.set(...targetView.position)
      targetLookAt.current.set(...targetView.target)

      if (isFirstRender) {
        // 首次渲染：标记需要初始化
        isInitializedRef.current = false
      } else {
        // 非首次：启动平滑过渡动画
        startPosition.current.copy(camera.position)
        if (controlsRef.current) {
          startTarget.current.copy(controlsRef.current.target)
        }
        setIsAnimating(true)
        animationProgress.current = 0
      }
    }
  }, [targetView, camera])

  // 每帧更新
  useFrame(() => {
    // 首次初始化：直接设置相机位置和目标
    if (!isInitializedRef.current && controlsRef.current) {
      camera.position.set(...targetView.position)
      controlsRef.current.target.set(...targetView.target)
      controlsRef.current.update()
      isInitializedRef.current = true
      return
    }

    // 动画中
    if (isAnimating && controlsRef.current) {
      animationProgress.current += 0.03
      const t = Math.min(animationProgress.current, 1)
      const easeT = 1 - Math.pow(1 - t, 3) // easeOutCubic

      // 插值相机位置
      camera.position.lerpVectors(startPosition.current, targetPosition.current, easeT)

      // 插值目标点
      controlsRef.current.target.lerpVectors(startTarget.current, targetLookAt.current, easeT)

      // 更新控制器
      controlsRef.current.update()

      // 动画完成
      if (t >= 1) {
        setIsAnimating(false)
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={30}
      maxPolarAngle={Math.PI / 2}
      minPolarAngle={0}
    />
  )
}

/**
 * 画廊 3D 场景组件
 */
export function GalleryScene({ currentView }: GallerySceneProps) {
  // 默认视角
  const view: CameraView = currentView || {
    position: [0, 1.6, 12],
    target: [0, 3, -10],
    id: 0,
  }

  // 从 Redux 获取已成功生成的图片（最多 7 张）
  const generatedImages = useSelector((state: RootState) =>
    state.images.history
      .filter(item => item.status === 'success' && item.imageUrl)
      .slice(0, 7)
      .map(item => {
        let url = item.imageUrl!
        if (url.includes('s3.siliconflow.cn')) {
          try {
            const urlObj = new URL(url)
            url = `/s3-proxy${urlObj.pathname}${urlObj.search}`
          } catch (e) {
            console.error('URL转换失败:', e)
          }
        }
        return url
      })
  )

  console.log('[GalleryScene] 显示图片数量:', generatedImages.length)

  return (
    <div className="w-full h-screen">
      <Canvas
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        performance={{ min: 0.5 }}
        shadows
      >
        <PerspectiveCamera makeDefault position={view.position} fov={90} />

        <ambientLight intensity={1.2} />

        <directionalLight
          position={[0, 10, 0]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={20}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0001}
          shadow-normalBias={0.02}
        />

        <pointLight position={[5, 4, 5]} intensity={0.8} />
        <pointLight position={[-5, 4, -5]} intensity={0.8} />
        <pointLight position={[0, 4, 0]} intensity={0.5} />

        <CameraAnimator targetView={view} />

        <Room />

        <Artwork
          position={[-5.92, 3, -6]}
          rotation={[0, Math.PI / 2, 0]}
          imageUrl={generatedImages[0]}
        />
        <Artwork
          position={[-5.92, 3, 0]}
          rotation={[0, Math.PI / 2, 0]}
          imageUrl={generatedImages[1]}
        />
        <Artwork
          position={[-5.92, 3, 6]}
          rotation={[0, Math.PI / 2, 0]}
          imageUrl={generatedImages[2]}
        />

        <Artwork
          position={[5.92, 3, -6]}
          rotation={[0, -Math.PI / 2, 0]}
          imageUrl={generatedImages[3]}
        />
        <Artwork
          position={[5.92, 3, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          imageUrl={generatedImages[4]}
        />
        <Artwork
          position={[5.92, 3, 6]}
          rotation={[0, -Math.PI / 2, 0]}
          imageUrl={generatedImages[5]}
        />

        <Artwork position={[0, 3, -9.92]} rotation={[0, 0, 0]} imageUrl={generatedImages[6]} />
      </Canvas>
    </div>
  )
}
