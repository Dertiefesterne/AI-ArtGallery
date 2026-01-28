import { useState } from 'react'
import { Modal, List, Tag, Space, Image, Empty, Tooltip, Button } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import type { GenerationStatus } from '@/types/history'
import './HistoryModal.css'

// 模拟历史数据
const mockHistory = [
  {
    id: '1',
    prompt: '赛博朋克风格的未来城市，霓虹灯光',
    style: 'cyberpunk',
    styleLabel: '赛博朋克',
    status: 'success' as GenerationStatus,
    imageUrl: 'https://picsum.photos/1024/1024?random=1',
    createdAt: '2024-01-20 14:30:25',
    duration: 28,
  },
  {
    id: '2',
    prompt: '印象派风格的日出风景',
    style: 'impressionism',
    styleLabel: '印象派',
    status: 'success' as GenerationStatus,
    imageUrl: 'https://picsum.photos/1024/1024?random=2',
    createdAt: '2024-01-20 15:15:10',
    duration: 32,
  },
  {
    id: '3',
    prompt: '像素艺术风格的复古游戏角色',
    style: 'pixel-art',
    styleLabel: '像素艺术',
    status: 'failed' as GenerationStatus,
    errorMessage: '服务器超时，请重试',
    createdAt: '2024-01-20 16:00:00',
    duration: 0,
  },
  {
    id: '4',
    prompt: '水彩画风格的花朵静物',
    style: 'watercolor',
    styleLabel: '水彩画',
    status: 'pending' as GenerationStatus,
    createdAt: '2024-01-20 16:30:00',
    duration: 0,
    queuePosition: 2,
  },
]

interface HistoryModalProps {
  open: boolean
  onClose: () => void
}

/**
 * 生成历史 Modal 组件
 *
 * 功能：
 * - 显示所有生成记录（成功、失败、进行中）
 * - 支持查看大图、下载、删除
 * - 按状态筛选
 * - 显示详细信息（耗时、风格、时间）
 */
export function HistoryModal({ open, onClose }: HistoryModalProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'success' | 'failed' | 'pending'>(
    'all'
  )

  // 筛选数据
  const filteredData =
    selectedTab === 'all'
      ? mockHistory
      : mockHistory.filter(item => item.status === selectedTab)

  // 状态统计
  const stats = {
    total: mockHistory.length,
    success: mockHistory.filter(i => i.status === 'success').length,
    failed: mockHistory.filter(i => i.status === 'failed').length,
    pending: mockHistory.filter(i => i.status === 'pending').length,
  }

  // 获取状态图标
  const getStatusIcon = (status: GenerationStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14', fontSize: 18 }} />
    }
  }

  // 获取状态标签
  const getStatusTag = (status: GenerationStatus) => {
    switch (status) {
      case 'success':
        return <Tag color="success">成功</Tag>
      case 'failed':
        return <Tag color="error">失败</Tag>
      case 'pending':
        return <Tag color="warning">生成中</Tag>
    }
  }

  // 处理删除
  const handleDelete = (id: string) => {
    console.log('删除记录:', id)
    // TODO: 实现删除功能
  }

  // 处理下载
  const handleDownload = (url: string, prompt: string) => {
    console.log('下载图片:', url)
    // TODO: 实现下载功能
  }

  // 处理查看大图
  const handlePreview = (url: string) => {
    console.log('查看大图:', url)
    // TODO: 实现预览功能
  }

  return (
    <Modal
      title={
        <Space>
          <span>📚 生成历史</span>
          <Tag color="blue">共 {stats.total} 条</Tag>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      className="history-modal"
    >
      {/* 统计标签 */}
      <div className="history-tabs">
        <Space size="middle">
          <Tag
            color={selectedTab === 'all' ? 'blue' : 'default'}
            className="tab-tag"
            onClick={() => setSelectedTab('all')}
          >
            全部 ({stats.total})
          </Tag>
          <Tag
            color={selectedTab === 'success' ? 'success' : 'default'}
            className="tab-tag"
            onClick={() => setSelectedTab('success')}
          >
            ✅ 成功 ({stats.success})
          </Tag>
          <Tag
            color={selectedTab === 'failed' ? 'error' : 'default'}
            className="tab-tag"
            onClick={() => setSelectedTab('failed')}
          >
            ❌ 失败 ({stats.failed})
          </Tag>
          <Tag
            color={selectedTab === 'pending' ? 'warning' : 'default'}
            className="tab-tag"
            onClick={() => setSelectedTab('pending')}
          >
            ⏳ 生成中 ({stats.pending})
          </Tag>
        </Space>
      </div>

      {/* 历史列表 */}
      {filteredData.length === 0 ? (
        <Empty description="暂无记录" style={{ margin: '40px 0' }} />
      ) : (
        <List
          className="history-list"
          dataSource={filteredData}
          renderItem={item => (
            <List.Item key={item.id} className="history-item">
              {/* 左侧：缩略图 */}
              <div className="history-thumbnail">
                {item.status === 'success' && item.imageUrl ? (
                  <div
                    className="thumbnail-wrapper"
                    onClick={() => handlePreview(item.imageUrl!)}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.prompt}
                      width={80}
                      height={80}
                      preview={false}
                      style={{ objectFit: 'cover', borderRadius: 8 }}
                    />
                    <div className="thumbnail-overlay">
                      <EyeOutlined />
                    </div>
                  </div>
                ) : (
                  <div className="thumbnail-placeholder">
                    {item.status === 'failed' ? '❌' : '⏳'}
                  </div>
                )}
              </div>

              {/* 中间：详细信息 */}
              <div className="history-content">
                <div className="history-header">
                  <Space>
                    {getStatusIcon(item.status)}
                    {getStatusTag(item.status)}
                    <Tag color="purple">{item.styleLabel}</Tag>
                  </Space>
                  <span className="history-time">{item.createdAt}</span>
                </div>

                <div className="history-prompt">{item.prompt}</div>

                <div className="history-meta">
                  <Space size="large">
                    {item.status === 'success' && (
                      <span>
                        ⏱️ 耗时 <strong>{item.duration}</strong> 秒
                      </span>
                    )}
                    {item.status === 'pending' && item.queuePosition && (
                      <span>
                        📍 队列位置 <strong>#{item.queuePosition}</strong>
                      </span>
                    )}
                    {item.status === 'failed' && item.errorMessage && (
                      <span className="error-message">❗ {item.errorMessage}</span>
                    )}
                  </Space>
                </div>
              </div>

              {/* 右侧：操作按钮 */}
              <div className="history-actions">
                <Space direction="vertical">
                  {item.status === 'success' && (
                    <>
                      <Tooltip title="查看大图">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => handlePreview(item.imageUrl!)}
                        >
                          查看
                        </Button>
                      </Tooltip>
                      <Tooltip title="下载图片">
                        <Button
                          type="text"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(item.imageUrl!, item.prompt)}
                        >
                          下载
                        </Button>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="删除记录">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.id)}
                    >
                      删除
                    </Button>
                  </Tooltip>
                </Space>
              </div>
            </List.Item>
          )}
        />
      )}
    </Modal>
  )
}
