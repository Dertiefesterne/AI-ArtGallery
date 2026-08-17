import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/hooks/useRedux'
import { selectAuth } from '@/stores/authSlice'

// 路由守卫：未登录跳转 /login，已登录才渲染画廊
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAppSelector(selectAuth)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}
