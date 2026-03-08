/**
 * SiliconFlow 图片生成 API 服务
 */

import type { SiliconFlowApiParams, SiliconFlowImageResponse } from '@/types/image'

const API_BASE_URL = 'https://api.siliconflow.cn/v1'
const API_KEY = import.meta.env.VITE_SILICONFLOW_API_KEY

/**
 * 风格预设映射
 */
export const STYLE_PRESETS: Record<string, string> = {
  cyberpunk: 'cyberpunk style, futuristic city with neon lights, high tech',
  watercolor: 'watercolor painting style, soft colors, artistic',
  oilPainting: 'oil painting style, classical art, masterpiece',
  sketch: 'pencil sketch style, black and white, detailed lines',
  anime: 'anime style, vibrant colors, manga art',
  realistic: 'photorealistic, highly detailed, professional photography',
  abstract: 'abstract art, modern artistic style, colorful shapes',
  impressionism: 'impressionist painting style, soft light, artistic brushwork',
}

/**
 * 调用 SiliconFlow 图片生成 API
 */
export async function generateImage(prompt: string, style: string): Promise<string> {
  // 检查 API Key
  if (!API_KEY) {
    throw new Error('SiliconFlow API Key 未配置，请检查 .env.local 文件')
  }

  // 构建完整提示词
  const stylePrompt = STYLE_PRESETS[style] || ''
  const fullPrompt = stylePrompt ? `${prompt}, ${stylePrompt}` : prompt

  // API 请求参数
  const params: SiliconFlowApiParams = {
    model: 'black-forest-labs/FLUX.1-schnell',
    prompt: fullPrompt,
    image_size: '1024x1024',
    num_inference_steps: 20,
  }

  try {
    const response = await fetch(`${API_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.message || `API 请求失败: ${response.status} ${response.statusText}`
      )
    }

    const data: SiliconFlowImageResponse = await response.json()

    // 返回图片 URL
    if (data.data && data.data[0] && data.data[0].url) {
      const imageUrl = data.data[0].url

      // 如果是 SiliconFlow S3 URL，转换为代理 URL 以绕过 CORS
      if (imageUrl.includes('s3.siliconflow.cn')) {
        const url = new URL(imageUrl)
        return `/s3-proxy${url.pathname}${url.search}`
      }

      return imageUrl
    }

    throw new Error('API 返回数据格式错误')
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('生成图片时发生未知错误')
  }
}

/**
 * 测试 API 连接
 */
export async function testApiConnection(): Promise<boolean> {
  if (!API_KEY) {
    return false
  }

  try {
    // 发送一个简单的测试请求
    const response = await fetch(`${API_BASE_URL}/models`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })

    return response.ok
  } catch {
    return false
  }
}
