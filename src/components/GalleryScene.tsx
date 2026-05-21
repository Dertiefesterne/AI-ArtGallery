import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useSelector } from 'react-redux'
import * as THREE from 'three'
import { Room } from './Room'
import { Artwork } from './Artwork'
import type { RootState } from '@/stores/store'
import type { CameraView } from '@/hooks/useCameraControl'
import type { KeyboardConfig } from '@/hooks/useKeyboardNavigation'
import type { ImageGeneration } from '@/types/image'

interface GallerySceneProps {
  currentView?: CameraView
  brightness?: number // 0-100 的亮度值
  onArtworkClick?: (artwork: ImageGeneration) => void
  enableKeyboard?: boolean // 是否启用键盘漫游，默认 true
}

/**
 * 相机动画控制器组件
 * 只在视角变化时执行平滑过渡，之后允许用户自由控制
 * 同时支持键盘漫游
 */
function CameraAnimator({
  targetView,
  config,
  enableKeyboard = true,
}: {
  targetView: CameraView
  config?: KeyboardConfig
  enableKeyboard?: boolean
}) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const moveConfig = useRef<KeyboardConfig>({
    moveSpeed: 0.1,
    rotationSpeed: 1,
    enableCollision: true,
    collisionBounds: new THREE.Box3(new THREE.Vector3(-15, 0, -20), new THREE.Vector3(15, 15, 20)),
    enableFootstep: false,
    ...config,
  })
  const keysPressed = useRef<Set<string>>(new Set())
  const moveVector = useRef(new THREE.Vector3())

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

  // 键盘事件监听器
  useEffect(() => {
    if (!enableKeyboard) {
      // 禁用键盘时清空已按下的键
      keysPressed.current.clear()
      return
    }

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
  }, [enableKeyboard])

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

    // 键盘移动（仅在非动画状态时)
    if (!isAnimating && keysPressed.current.size > 0 && controlsRef.current) {
      const speed = moveConfig.current.moveSpeed
      moveVector.current.set(0, 0, 0)

      // 获取相机朝向（水平方向）
      const forward = new THREE.Vector3()
      camera.getWorldDirection(forward)
      forward.y = 0 // 保持在水平面上
      forward.normalize()

      // 计算右方向
      const right = new THREE.Vector3()
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

      // 根据按键计算移动方向
      if (keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp')) {
        moveVector.current.add(forward.clone().multiplyScalar(speed))
      }
      if (keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown')) {
        moveVector.current.add(forward.clone().multiplyScalar(-speed))
      }
      if (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft')) {
        moveVector.current.add(right.clone().multiplyScalar(-speed))
      }
      if (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight')) {
        moveVector.current.add(right.clone().multiplyScalar(speed))
      }

      // 检查碰撞
      if (moveVector.current.length() > 0.01 && moveConfig.current.enableCollision) {
        const newPosition = camera.position.clone().add(moveVector.current)
        if (!moveConfig.current.collisionBounds.containsPoint(newPosition)) {
          moveVector.current.set(0, 0, 0)
        }
      }

      // 应用移动
      if (moveVector.current.length() > 0.01) {
        camera.position.add(moveVector.current)
        controlsRef.current.target.add(moveVector.current)
        controlsRef.current.update()
      }
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

// 从文件路径中提取书名
const getArtworkTitle = (path: string): string => {
  const match = path.match(/《(.+?)》/)
  return match ? match[1] : path
}

// 画廊自带艺术品图片路径
const ARTWORK_IMAGES = [
  { path: '/artworks/包雪蕾 《冬煦——阿尔山不冻河的畅想》.jpg', author: '包雪蕾' },
  { path: '/artworks/何馥君 《和谐的旋律》.jpg', author: '何馥君' },
  { path: '/artworks/李夏夏 《万物同天》.jpg', author: '李夏夏' },
  { path: '/artworks/卢贞 《春山可望》.jpg', author: '卢贞' },
  { path: '/artworks/魏艳 《幸福专列》.jpg', author: '魏艳' },
  { path: '/artworks/杨晶 《听花开的声音》.jpg', author: '杨晶' },
  { path: '/artworks/詹斯斯 《向光而行》.jpg', author: '詹斯斯' },
  { path: '/artworks/周文瑶 《时光来信》.jpg', author: '周文瑶' },
]

/**
 * 画廊 3D 场景组件
 */
export function GalleryScene({ currentView, brightness = 50, onArtworkClick, enableKeyboard = true }: GallerySceneProps) {
  // 默认视角
  const view: CameraView = currentView || {
    position: [0, 1.6, 12],
    target: [0, 3, -10],
    id: 0,
  }

  // 计算光照强度系数（brightness 0-100 映射到 0.2-2.0）
  const intensityMultiplier = 0.2 + (brightness / 100) * 1.8

  // 从 Redux 获取已成功生成的图片（最多 7 张）- 保留完整对象
  const galleryItems = useSelector((state: RootState) =>
    state.images.history
      .filter(item => item.status === 'success' && item.imageUrl)
      .slice(0, 7)
  )

  // 转换 S3 URL 为代理 URL
  const convertToProxyUrl = (url: string) => {
    if (url.includes('s3.siliconflow.cn')) {
      try {
        const urlObj = new URL(url)
        return '/s3-proxy' + urlObj.pathname + urlObj.search
      } catch (e) {
        return url
      }
    }
    return url
  }

  console.log('[GalleryScene] 显示图片数量:', galleryItems.length)

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

        {/* 环境光 - 明亮全局照明 */}
        <ambientLight intensity={1.0 * intensityMultiplier} color="#faf8f5" />

        {/* 主光源 - 模拟天窗自然光，不投射阴影 */}
        <directionalLight
          position={[2, 12, 0]}
          intensity={1.2 * intensityMultiplier}
          color="#fffaf5"
        />

        {/* 地板补光 - 照亮地板 */}
        <pointLight position={[0, 0.5, 0]} intensity={0.6 * intensityMultiplier} color="#f5f0ea" />

        {/* 左侧补光 */}
        <pointLight position={[-4, 4, 0]} intensity={0.5 * intensityMultiplier} color="#f5f0ea" />

        {/* 右侧补光 */}
        <pointLight position={[4, 4, 0]} intensity={0.5 * intensityMultiplier} color="#f5f0ea" />

        {/* 走廊两端补光 */}
        <pointLight position={[0, 4, 8]} intensity={0.6 * intensityMultiplier} color="#fff8f0" />
        <pointLight position={[0, 4, -8]} intensity={0.6 * intensityMultiplier} color="#fff8f0" />

        {/* 艺术品射灯 - 左墙 - 从画上方照射 */}
        <spotLight position={[-4, 7, -6]} target-position={[-5.92, 3, -6]} intensity={2 * intensityMultiplier} color="#fffaf0" angle={0.4} penumbra={0.8} />
        <spotLight position={[-4, 7, 0]} target-position={[-5.92, 3, 0]} intensity={2 * intensityMultiplier} color="#fffaf0" angle={0.4} penumbra={0.8} />
        <spotLight position={[-4, 7, 6]} target-position={[-5.92, 3, 6]} intensity={2 * intensityMultiplier} color="#fffaf0" angle={0.4} penumbra={0.8} />

        {/* 艺术品射灯 - 右墙 - 从画上方照射 */}
        <spotLight position={[4, 7, -6]} target-position={[5.92, 3, -6]} intensity={2 * intensityMultiplier} color="#fffaf0" angle={0.4} penumbra={0.8} />
        <spotLight position={[4, 7, 0]} target-position={[5.92, 3, 0]} intensity={2 * intensityMultiplier} color="#fffaf0" angle={0.4} penumbra={0.8} />
        <spotLight position={[4, 7, 6]} target-position={[5.92, 3, 6]} intensity={2 * intensityMultiplier} color="#fffaf0" angle={0.4} penumbra={0.8} />

        {/* 尽头墙射灯 - 从画上方照射 */}
        <spotLight position={[0, 7, -6]} target-position={[0, 3, -9.92]} intensity={2 * intensityMultiplier} color="#fffaf0" angle={0.4} penumbra={0.8} />

        <CameraAnimator targetView={view} enableKeyboard={enableKeyboard} />

        <Room />

        <Artwork
          position={[-5.92, 3, -6]}
          rotation={[0, Math.PI / 2, 0]}
          imageUrl={ARTWORK_IMAGES[0].path}
          prompt={getArtworkTitle(ARTWORK_IMAGES[0].path)}
          styleLabel={ARTWORK_IMAGES[0].author}
          onClick={() => {}}
        />
        <Artwork
          position={[-5.92, 3, 0]}
          rotation={[0, Math.PI / 2, 0]}
          imageUrl={ARTWORK_IMAGES[1].path}
          prompt={getArtworkTitle(ARTWORK_IMAGES[1].path)}
          styleLabel={ARTWORK_IMAGES[1].author}
          onClick={() => {}}
        />
        <Artwork
          position={[-5.92, 3, 6]}
          rotation={[0, Math.PI / 2, 0]}
          imageUrl={ARTWORK_IMAGES[2].path}
          prompt={getArtworkTitle(ARTWORK_IMAGES[2].path)}
          styleLabel={ARTWORK_IMAGES[2].author}
          onClick={() => {}}
        />

        <Artwork
          position={[5.92, 3, -6]}
          rotation={[0, -Math.PI / 2, 0]}
          imageUrl={ARTWORK_IMAGES[3].path}
          prompt={getArtworkTitle(ARTWORK_IMAGES[3].path)}
          styleLabel={ARTWORK_IMAGES[3].author}
          onClick={() => {}}
        />
        <Artwork
          position={[5.92, 3, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          imageUrl={ARTWORK_IMAGES[4].path}
          prompt={getArtworkTitle(ARTWORK_IMAGES[4].path)}
          styleLabel={ARTWORK_IMAGES[4].author}
          onClick={() => {}}
        />
        <Artwork
          position={[5.92, 3, 6]}
          rotation={[0, -Math.PI / 2, 0]}
          imageUrl={ARTWORK_IMAGES[5].path}
          prompt={getArtworkTitle(ARTWORK_IMAGES[5].path)}
          styleLabel={ARTWORK_IMAGES[5].author}
          onClick={() => {}}
        />

        <Artwork position={[0, 3, -9.92]} rotation={[0, 0, 0]} imageUrl={ARTWORK_IMAGES[6].path}
          prompt={getArtworkTitle(ARTWORK_IMAGES[6].path)}
          styleLabel={ARTWORK_IMAGES[6].author}
          onClick={() => {}} />

        <Artwork position={[0, 3, -9.92]} rotation={[0, 0, 0]} imageUrl={ARTWORK_IMAGES[7].path}
          prompt={getArtworkTitle(ARTWORK_IMAGES[7].path)}
          styleLabel={ARTWORK_IMAGES[7].author}
          onClick={() => {}} />
      </Canvas>
    </div>
  )
}
