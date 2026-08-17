import { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface AnimalCrossingCameraProps {
  center?: [number, number, number]
  initialAngle?: number
  radius?: number
  height?: number
  rotateSpeed?: number
  moveSpeed?: number
  dampingFactor?: number
  minRadius?: number
  maxRadius?: number
}

export function AnimalCrossingCamera({
  center = [0, 0, 0],
  initialAngle = 0,
  radius = 10,
  height = 3,
  rotateSpeed = 0.005,
  moveSpeed = 0.1,
  dampingFactor = 0.08,
  minRadius = 5,
  maxRadius = 18,
}: AnimalCrossingCameraProps) {
  const { camera, gl } = useThree()

  const stateRef = useRef({
    angle: initialAngle,
    targetAngle: initialAngle,
    radius: radius,
    targetRadius: radius,
    height: height,
    targetHeight: height,
    isDragging: false,
    lastMouseX: 0,
    keysPressed: new Set<string>(),
  })

  const updateCameraPosition = useCallback(() => {
    const state = stateRef.current
    const [cx, cy, cz] = center

    state.angle += (state.targetAngle - state.angle) * dampingFactor
    state.radius += (state.targetRadius - state.radius) * dampingFactor
    state.height += (state.targetHeight - state.height) * dampingFactor

    const x = cx + Math.sin(state.angle) * state.radius
    const z = cz + Math.cos(state.angle) * state.radius
    const y = state.height

    camera.position.set(x, y, z)

    const lookAtY = cy + 2
    camera.lookAt(cx, lookAtY, cz)

    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
    euler.z = 0
    camera.quaternion.setFromEuler(euler)
  }, [camera, center, dampingFactor])

  useEffect(() => {
    const canvas = gl.domElement

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        stateRef.current.isDragging = true
        stateRef.current.lastMouseX = event.clientX
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!stateRef.current.isDragging) return
      const deltaX = event.clientX - stateRef.current.lastMouseX
      stateRef.current.targetAngle -= deltaX * rotateSpeed
      stateRef.current.lastMouseX = event.clientX
    }

    const handleMouseUp = () => {
      stateRef.current.isDragging = false
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 1) {
        stateRef.current.isDragging = true
        stateRef.current.lastMouseX = event.touches[0].clientX
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      if (!stateRef.current.isDragging || event.touches.length !== 1) return
      event.preventDefault()
      const deltaX = event.touches[0].clientX - stateRef.current.lastMouseX
      stateRef.current.targetAngle -= deltaX * rotateSpeed
      stateRef.current.lastMouseX = event.touches[0].clientX
    }

    const handleTouchEnd = () => {
      stateRef.current.isDragging = false
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const delta = event.deltaY > 0 ? 0.5 : -0.5
      stateRef.current.targetRadius = Math.max(
        minRadius,
        Math.min(maxRadius, stateRef.current.targetRadius + delta)
      )
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)
    canvas.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [gl, rotateSpeed, minRadius, maxRadius])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      stateRef.current.keysPressed.add(event.code)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      stateRef.current.keysPressed.delete(event.code)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    const state = stateRef.current
    const keys = state.keysPressed

    if (keys.has('KeyA') || keys.has('ArrowLeft')) {
      state.targetAngle += rotateSpeed * 15
    }
    if (keys.has('KeyD') || keys.has('ArrowRight')) {
      state.targetAngle -= rotateSpeed * 15
    }
    if (keys.has('KeyW') || keys.has('ArrowUp')) {
      state.targetRadius = Math.max(minRadius, state.targetRadius - moveSpeed)
    }
    if (keys.has('KeyS') || keys.has('ArrowDown')) {
      state.targetRadius = Math.min(maxRadius, state.targetRadius + moveSpeed)
    }

    if (keys.has('KeyQ')) {
      state.targetHeight = Math.max(1.5, state.targetHeight - moveSpeed * 0.5)
    }
    if (keys.has('KeyE')) {
      state.targetHeight = Math.min(8, state.targetHeight + moveSpeed * 0.5)
    }

    updateCameraPosition()
  })

  return null
}
