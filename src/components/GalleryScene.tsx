import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'

/**
 * 画廊 3D 场景组件
 *
 * 性能要求：
 * - 帧率锁定 60 FPS
 * - Draw calls ≤ 100
 * - 模型文件 ≤ 5 MB（使用 Draco 压缩）
 */
export function GalleryScene() {
  return (
    <div className="w-full h-screen">
      <Canvas
        dpr={[1, 2]} // 像素比，限制在 1-2 之间以优化性能
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        performance={{ min: 0.5 }} // 性能降级阈值
      >
        <Suspense fallback={null}>
          {/* 相机设置 */}
          <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={50} />

          {/* 环境光和阴影 */}
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

          {/* 相机控制 */}
          <OrbitControls
            makeDefault
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2}
          />

          {/* 接触阴影 */}
          <ContactShadows position={[0, -0.5, 0]} opacity={0.6} scale={20} blur={2} far={10} />

          {/* 这里后续会添加画廊场景、画作、灯光等 */}
          {/* 示例：一个简单的地面 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  )
}
