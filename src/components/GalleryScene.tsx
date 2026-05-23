import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { useSelector } from 'react-redux'
import * as THREE from 'three'
// @ts-ignore - three examples 不在 types 中
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
// @ts-ignore
const PointerLockControlsAny = PointerLockControls as any
import { Room } from './Room'
import { Artwork } from './Artwork'
import type { RootState } from '@/stores/store'
import type { CameraView } from '@/hooks/useCameraControl'
import type { ImageGeneration } from '@/types/image'

interface GallerySceneProps {
  currentView?: CameraView
  brightness?: number // 0-100 的亮度值
  onArtworkClick?: (artwork: ImageGeneration) => void
  enableKeyboard?: boolean // 是否启用键盘漫游，默认 true
}

// 第一人称相机控制器 Hook
function useFirstPersonControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef<any>(null)
  const keysPressed = useRef<Set<string>>(new Set())
  const isLocked = useRef(false)
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const autoUnlockTimer = useRef<number | null>(null)

  // 固定眼睛高度
  const EYE_HEIGHT = 1.8

  // 碰撞边界
  const collisionBounds = useRef(
    new THREE.Box3(new THREE.Vector3(-15, 0, -20), new THREE.Vector3(15, 10, 20))
  )

  // 移动速度
  const moveSpeed = 0.08

  // 鼠标灵敏度
  const mouseSensitivity = 0.002

  // 自动退出锁定定时器
  const AUTO_UNLOCK_DELAY = 2000 // 2秒后自动退出锁定

  const clearAutoUnlockTimer = () => {
    if (autoUnlockTimer.current !== null) {
      window.clearTimeout(autoUnlockTimer.current)
      autoUnlockTimer.current = null
    }
  }

  const startAutoUnlockTimer = () => {
    clearAutoUnlockTimer()
    autoUnlockTimer.current = window.setTimeout(() => {
      if (controlsRef.current && isLocked.current) {
        controlsRef.current.unlock()
      }
    }, AUTO_UNLOCK_DELAY)
  }

  // 初始化
  useEffect(() => {
    // 创建 PointerLockControls
    const controls = new PointerLockControlsAny(camera, gl.domElement)
    controlsRef.current = controls

    controls.addEventListener('lock', () => {
      isLocked.current = true
    })

    controls.addEventListener('unlock', () => {
      isLocked.current = false
    })

    return () => {
      controls.dispose()
    }
  }, [camera, gl])

  // 鼠标移动处理（用于未锁定时的视角旋转）
  useEffect(() => {
    const canvas = gl.domElement

    const handleMouseMove = (event: MouseEvent) => {
      if (isLocked.current) return // 锁定后由 PointerLockControls 处理

      // 鼠标拖拽旋转
      if (event.buttons === 1) { // 左键拖拽
        const movementX = event.movementX || 0
        const movementY = event.movementY || 0

        euler.current.y -= movementX * mouseSensitivity
        euler.current.x -= movementY * mouseSensitivity

        // 限制垂直旋转角度
        euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x))

        camera.quaternion.setFromEuler(euler.current)

        // 用户在旋转，启动自动退出定时器
        startAutoUnlockTimer()
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      clearAutoUnlockTimer()
    }
  }, [camera, gl])

  // 点击画布锁定鼠标
  useEffect(() => {
    const canvas = gl.domElement

    const handleClick = () => {
      if (!isLocked.current && controlsRef.current) {
        controlsRef.current.lock()
      }
    }

    canvas.addEventListener('click', handleClick)
    return () => {
      canvas.removeEventListener('click', handleClick)
    }
  }, [gl])

  // 滚轮控制前进/后退
  useEffect(() => {
    const canvas = gl.domElement

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()

      // 获取相机朝向（水平方向）
      const forward = new THREE.Vector3()
      camera.getWorldDirection(forward)
      forward.y = 0
      forward.normalize()

      // 滚轮向上（往前），滚轮向下（往后）
      const scrollSpeed = 0.3
      const scrollAmount = event.deltaY > 0 ? scrollSpeed : -scrollSpeed

      const moveVector = forward.clone().multiplyScalar(scrollAmount)

      // 检查碰撞
      const newPosition = camera.position.clone().add(moveVector)
      newPosition.y = EYE_HEIGHT

      if (collisionBounds.current.containsPoint(newPosition)) {
        camera.position.add(moveVector)
      }
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [camera, gl])

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

  // 每帧更新
  useFrame(() => {
    if (!controlsRef.current) return

    // 键盘视角控制（始终可用）
    if (keysPressed.current.size > 0) {
      // W/S 仰/俯视角
      if (keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp')) {
        euler.current.x += 0.01
        euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x))
        camera.quaternion.setFromEuler(euler.current)
        startAutoUnlockTimer()
      }
      if (keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown')) {
        euler.current.x -= 0.01
        euler.current.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, euler.current.x))
        camera.quaternion.setFromEuler(euler.current)
        startAutoUnlockTimer()
      }

      // A/D 左右平移
      if (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft')) {
        const moveVector = new THREE.Vector3()
        const forward = new THREE.Vector3()
        camera.getWorldDirection(forward)
        forward.y = 0
        forward.normalize()
        const right = new THREE.Vector3()
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
        moveVector.add(right.clone().multiplyScalar(-moveSpeed))

        const newPosition = camera.position.clone().add(moveVector)
        newPosition.y = EYE_HEIGHT
        if (collisionBounds.current.containsPoint(newPosition)) {
          camera.position.add(moveVector)
        }
      }
      if (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight')) {
        const moveVector = new THREE.Vector3()
        const forward = new THREE.Vector3()
        camera.getWorldDirection(forward)
        forward.y = 0
        forward.normalize()
        const right = new THREE.Vector3()
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
        moveVector.add(right.clone().multiplyScalar(moveSpeed))

        const newPosition = camera.position.clone().add(moveVector)
        newPosition.y = EYE_HEIGHT
        if (collisionBounds.current.containsPoint(newPosition)) {
          camera.position.add(moveVector)
        }
      }
    }

    // 保持固定高度
    camera.position.y = EYE_HEIGHT
  })

  return controlsRef
}

/**
 * 第一人称相机控制组件
 */
function FirstPersonController({
  enableKeyboard: _enableKeyboard = true,
}: {
  enableKeyboard?: boolean
}) {
  useFirstPersonControls()
  return null
}

// 保留视角动画功能（用于初始加载和视角切换）
function CameraAnimator({
  targetView,
}: {
  targetView: CameraView
}) {
  const { camera } = useThree()
  const lastViewIdRef = useRef<number>(-1)
  const isInitializedRef = useRef(false)
  const animationProgress = useRef(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const startPosition = useRef(new THREE.Vector3())
  const targetPosition = useRef(new THREE.Vector3(...targetView.position))

  useEffect(() => {
    if (lastViewIdRef.current !== targetView.id) {
      const isFirstRender = lastViewIdRef.current === -1
      lastViewIdRef.current = targetView.id

      targetPosition.current.set(...targetView.position)

      if (!isFirstRender) {
        startPosition.current.copy(camera.position)
        setIsAnimating(true)
        animationProgress.current = 0
      }
    }
  }, [targetView, camera])

  useFrame(() => {
    // 首次初始化：直接设置相机位置
    if (!isInitializedRef.current) {
      camera.position.set(...targetView.position)
      isInitializedRef.current = true
      return
    }

    // 动画过渡
    if (isAnimating) {
      animationProgress.current += 0.03
      const t = Math.min(animationProgress.current, 1)
      const easeT = 1 - Math.pow(1 - t, 3)

      camera.position.lerpVectors(startPosition.current, targetPosition.current, easeT)

      if (t >= 1) {
        setIsAnimating(false)
      }
    }
  })

  return null
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
export function GalleryScene({ currentView, brightness = 50, onArtworkClick: _onArtworkClick, enableKeyboard = true }: GallerySceneProps) {
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

        <FirstPersonController enableKeyboard={enableKeyboard} />
        <CameraAnimator targetView={view} />

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
