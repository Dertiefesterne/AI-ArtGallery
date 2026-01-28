/**
 * 生成任务状态
 */
export type GenerationStatus = 'success' | 'failed' | 'pending'

/**
 * 生成历史记录
 */
export interface GenerationHistory {
  id: string
  prompt: string
  style: string
  styleLabel: string
  status: GenerationStatus
  imageUrl?: string
  errorMessage?: string
  createdAt: string
  duration: number // 生成耗时（秒）
  queuePosition?: number // 队列位置（进行中时）
}
