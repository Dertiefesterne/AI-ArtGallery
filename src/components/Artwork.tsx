import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { TextureLoader } from 'three'

interface ArtworkProps {
  position: [number, number, number]
  rotation: [number, number, number]
  imageUrl?: string
}

export function Artwork({ position, rotation, imageUrl }: ArtworkProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

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

  const frameMaterial = (
    <meshStandardMaterial
      color="#d4af37"
      roughness={0.3}
      metalness={0.8}
    />
  )

  const trimMaterial = <meshStandardMaterial color="#f4d03f" roughness={0.2} metalness={0.9} />

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 2.1, 0.08]} />
        {frameMaterial}
      </mesh>

      <mesh position={[0, 0, 0.06]} castShadow>
        <boxGeometry args={[1.5, 2, 0.04]} />
        {trimMaterial}
      </mesh>

      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[1.4, 1.9]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0, 0.12]}>
        <boxGeometry args={[1.3, 1.8, 0.01]} />
        {texture ? (
          <meshBasicMaterial map={texture} color="#ffffff" />
        ) : (
          <meshStandardMaterial color="#4a5568" roughness={0.8} />
        )}
      </mesh>

      <mesh position={[0, 1.05, 0.09]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.02]} />
        {trimMaterial}
      </mesh>

      <mesh position={[0, -1.05, 0.09]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.02]} />
        {trimMaterial}
      </mesh>

      <mesh position={[0.75, 0, 0.09]} castShadow>
        <boxGeometry args={[0.05, 0.3, 0.02]} />
        {trimMaterial}
      </mesh>
      <mesh position={[-0.75, 0, 0.09]} castShadow>
        <boxGeometry args={[0.05, 0.3, 0.02]} />
        {trimMaterial}
      </mesh>

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
