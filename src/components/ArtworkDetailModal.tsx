/**
 * 艺术品详情弹窗组件
 *
 * 功能：
 * - 显示艺术品大图
 * - 显示生成信息（prompt、风格、时间等）
 * - 下载艺术品
 * - 删除艺术品
 */

import { Modal, Button, Tag, Space, Descriptions, message } from 'antd'
import { DownloadOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons'
import type { ImageGeneration } from '@/types/image'

interface ArtworkDetailModalProps {
  open: boolean
  artwork: ImageGeneration | null
  onClose: () => void
  onDelete: (id: string) => void
}

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

// 处理下载
const handleDownload = (url: string, prompt: string) => {
  const proxyUrl = convertToProxyUrl(url)
  const link = document.createElement('a')
  link.href = proxyUrl
  const safeName = prompt.slice(0, 20).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
  link.download = 'AI-Art-' + safeName + '.png'
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  message.success('开始下载')
}

export function ArtworkDetailModal({ open, artwork, onClose, onDelete }: ArtworkDetailModalProps) {
  if (!artwork) return null

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要从画廊中移除这件艺术品吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        onDelete(artwork.id)
        onClose()
        message.success('已移除艺术品')
      },
    })
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      className="artwork-detail-modal"
      centered
      title={
        <Space>
          <PictureOutlined />
          <span>艺术品详情</span>
        </Space>
      }
    >
      <div className="artwork-detail-content">
        <div className="artwork-image-container">
          <img
            src={convertToProxyUrl(artwork.imageUrl!)}
            alt={artwork.prompt}
            className="artwork-detail-image"
          />
        </div>

        <Descriptions column={1} size="small" className="artwork-descriptions">
          <Descriptions.Item label="作品描述">
            <div className="artwork-prompt">{artwork.prompt}</div>
          </Descriptions.Item>
          <Descriptions.Item label="艺术风格">
            <Tag color="purple">{artwork.styleLabel}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="生成时间">{artwork.createdAt}</Descriptions.Item>
          {artwork.duration && <Descriptions.Item label="生成耗时">{artwork.duration} 秒</Descriptions.Item>}
        </Descriptions>

        <div className="artwork-actions">
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(artwork.imageUrl!, artwork.prompt)}
          >
            下载图片
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            移除艺术品
          </Button>
        </div>
      </div>
    </Modal>
  )
}
