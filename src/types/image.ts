/**
 * 图片生成相关类型定义
 */

/**
 * 生成状态
 */
export type GenerationStatus = 'pending' | 'generating' | 'success' | 'failed'

/**
 * 图片生成任务
 */
export interface ImageGeneration {
  id: string                    // 唯一标识
  prompt: string                // 文本描述
  style: string                 // 风格标识
  styleLabel: string            // 风格显示名称
  status: GenerationStatus      // 当前状态
  progress: number              // 生成进度 0-100
  imageUrl?: string             // 生成的图片 URL
  error?: string                // 错误信息
  createdAt: string             // 创建时间
  duration?: number             // 生成耗时（秒）
  queuePosition?: number        // 队列位置（仅 pending 状态有值）
}

/**
 * 生成参数
 */
export interface GenerationParams {
  prompt: string                // 文本描述
  style: string                 // 风格标识
  styleLabel: string            // 风格显示名称
}

/**
 * SiliconFlow API 响应
 */
export interface SiliconFlowImageResponse {
  created: number
  data: {
    url?: string               // 图片 URL
    b64_json?: string          // Base64 图片数据
  }[]
}

/**
 * SiliconFlow API 请求参数
 */
export interface SiliconFlowApiParams {
  model: string                // 模型名称
  prompt: string               // 提示词
  image_size: string           // 图片尺寸
  num_inference_steps: number  // 推理步数
}
