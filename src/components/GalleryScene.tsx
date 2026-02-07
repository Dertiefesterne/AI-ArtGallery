import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import { useSelector } from 'react-redux'
import { Room } from './Room'
import { Artwork } from './Artwork'
import type { RootState } from '@/stores/store'

/**
 * 画廊 3D 场景组件
 *
 * 设计：
 * - 竖直走廊画廊（12×20×8米）
 * - 7幅画作（左墙3幅+右墙3幅+尽头墙1幅）
 * - 古典欧式金色画框
 * - 顶部环境照明
 * - 动态显示生成的图片
 */
export function GalleryScene() {
  // 从 Redux 获取已成功生成的图片（最多 7 张）
  const generatedImages = useSelector((state: RootState) =>
    state.images.history
      .filter((item) => item.status === 'success' && item.imageUrl)
      .slice(0, 7)
      .map((item) => item.imageUrl!)
  )
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
        <Suspense fallback={null}>
          {/* 相机设置 - 第一人称视角 */}
          <PerspectiveCamera makeDefault position={[0, 1.6, 12]} fov={90} />

          {/* 环境光和阴影 */}
          <Environment preset="apartment" />
          <ambientLight intensity={0.4} />

          {/* 顶部环境光 - 柔和的整体照明 */}
          <directionalLight
            position={[0, 10, 0]}
            intensity={0.8}
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

          {/* 补充光源 */}
          <pointLight position={[5, 4, 5]} intensity={0.3} />
          <pointLight position={[-5, 4, -5]} intensity={0.3} />

          {/* 相机控制 */}
          <OrbitControls
            makeDefault
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={0}
            target={[0, 3, -10]}
          />

          {/* 画廊房间 */}
          <Room />

          {/* 左墙（X=-6）：3幅画，面向右侧（走廊内部） */}
          <Artwork position={[-5.92, 3, -6]} rotation={[0, Math.PI / 2, 0]} imageUrl={generatedImages[0]} />
          <Artwork position={[-5.92, 3, 0]} rotation={[0, Math.PI / 2, 0]} imageUrl={generatedImages[1]} />
          <Artwork position={[-5.92, 3, 6]} rotation={[0, Math.PI / 2, 0]} imageUrl={generatedImages[2]} />

          {/* 右墙（X=6）：3幅画，面向左侧（走廊内部） */}
          <Artwork position={[5.92, 3, -6]} rotation={[0, -Math.PI / 2, 0]} imageUrl={generatedImages[3]} />
          <Artwork position={[5.92, 3, 0]} rotation={[0, -Math.PI / 2, 0]} imageUrl={generatedImages[4]} />
          <Artwork position={[5.92, 3, 6]} rotation={[0, -Math.PI / 2, 0]} imageUrl={generatedImages[5]} />

          {/* 走廊尽头墙（Z=-10）：1幅画，面向前方（走廊入口） */}
          <Artwork position={[0, 3, -9.92]} rotation={[0, 0, 0]} imageUrl={generatedImages[6]} />
        </Suspense>
      </Canvas>
    </div>
  )
}
