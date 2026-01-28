import { useState } from 'react'
import { Drawer, List, Progress, Tag, Space, Button, Card, Tooltip } from 'antd'
import {
  CloseCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import './QueueDrawer.css'

// 模拟队列数据
const mockQueue = [
  {
    id: '1',
    prompt: '赛博朋克风格的未来城市',
    style: 'cyberpunk',
    styleLabel: '赛博朋克',
    status: 'generating',
    progress: 65,
    eta: 15,
    createdAt: '2024-01-20 16:35:00',
  },
  {
    id: '2',
    prompt: '水彩画风格的自然风景',
    style: 'watercolor',
    styleLabel: '水彩画',
    status: 'waiting',
    progress: 0,
    eta: 45,
    createdAt: '2024-01-20 16:36:00',
  },
  {
    id: '3',
    prompt: '像素艺术风格的游戏角色',
    style: 'pixel-art',
    styleLabel: '像素艺术',
    status: 'waiting',
    progress: 0,
    eta: 75,
    createdAt: '2024-01-20 16:37:00',
  },
]

type QueueStatus = 'generating' | 'waiting' | 'paused' | 'failed'

interface QueueItem {
  id: string
  prompt: string
  style: string
  styleLabel: string
  status: QueueStatus
  progress: number
  eta: number // 预计等待时间（秒）
  createdAt: string
}

interface QueueDrawerProps {
  open: boolean
  onClose: () => void
  count: number
}

/**
 * 生成队列详情面板
 *
 * 功能：
 * - 显示当前队列中的所有任务
 * - 实时更新进度（模拟）
 * - 支持暂停、取消任务
 * - 显示预计等待时间
 */
export function QueueDrawer({ open, onClose, count }: QueueDrawerProps) {
  const [queue, setQueue] = useState<QueueItem[]>(mockQueue)

  // 获取状态标签
  const getStatusTag = (status: QueueStatus) => {
    switch (status) {
      case 'generating':
        return <Tag color="processing">生成中</Tag>
      case 'waiting':
        return <Tag color="default">等待中</Tag>
      case 'paused':
        return <Tag color="warning">已暂停</Tag>
      case 'failed':
        return <Tag color="error">失败</Tag>
    }
  }

  // 获取状态图标
  const getStatusIcon = (status: QueueStatus) => {
    switch (status) {
      case 'generating':
        return <PlayCircleOutlined style={{ color: '#52c41a' }} />
      case 'waiting':
        return <ClockCircleOutlined style={{ color: '#9ca3af' }} />
      case 'paused':
        return <PauseCircleOutlined style={{ color: '#faad14' }} />
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
    }
  }

  // 处理暂停/继续
  const handleTogglePause = (id: string) => {
    console.log('切换暂停状态:', id)
    // TODO: 实现暂停功能
  }

  // 处理取消
  const handleCancel = (id: string) => {
    console.log('取消任务:', id)
    setQueue(queue.filter(item => item.id !== id))
  }

  // 计算总预计时间
  const totalEta = queue.reduce((sum, item) => sum + item.eta, 0)

  return (
    <Drawer
      title={
        <Space>
          <ClockCircleOutlined />
          <span>生成队列</span>
          <Tag color="blue">{count} 个任务</Tag>
        </Space>
      }
      placement="right"
      size={420}
      open={open}
      onClose={onClose}
      className="queue-drawer"
    >
      {/* 队列统计 */}
      <Card className="queue-summary" size="small">
        <div className="summary-item">
          <span className="summary-label">总预计时间</span>
          <span className="summary-value">
            {Math.floor(totalEta / 60)} 分 {totalEta % 60} 秒
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">正在生成</span>
          <span className="summary-value">
            {queue.filter(i => i.status === 'generating').length} 个
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">等待中</span>
          <span className="summary-value">
            {queue.filter(i => i.status === 'waiting').length} 个
          </span>
        </div>
      </Card>

      {/* 队列列表 */}
      <List
        className="queue-list"
        dataSource={queue}
        renderItem={(item, index) => (
          <List.Item key={item.id} className="queue-item">
            <div className="queue-item-content">
              {/* 头部：序号和状态 */}
              <div className="queue-item-header">
                <Space>
                  <span className="queue-number">#{index + 1}</span>
                  {getStatusIcon(item.status)}
                  {getStatusTag(item.status)}
                  <Tag color="purple">{item.styleLabel}</Tag>
                </Space>
                <span className="queue-time">{item.createdAt}</span>
              </div>

              {/* 描述 */}
              <div className="queue-prompt">{item.prompt}</div>

              {/* 进度条 */}
              {item.status === 'generating' && (
                <div className="queue-progress">
                  <Progress
                    percent={item.progress}
                    status="active"
                    strokeColor="#3b82f6"
                    size="small"
                  />
                  <span className="progress-text">预计 {item.eta} 秒</span>
                </div>
              )}

              {item.status === 'waiting' && (
                <div className="queue-progress">
                  <span className="waiting-text">
                    ⏳ 预计等待 {Math.floor(item.eta / 60)} 分 {item.eta % 60} 秒
                  </span>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="queue-actions">
                <Space>
                  {item.status === 'generating' && (
                    <Tooltip title="暂停">
                      <Button
                        type="text"
                        size="small"
                        icon={<PauseCircleOutlined />}
                        onClick={() => handleTogglePause(item.id)}
                      >
                        暂停
                      </Button>
                    </Tooltip>
                  )}
                  {item.status === 'paused' && (
                    <Tooltip title="继续">
                      <Button
                        type="text"
                        size="small"
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleTogglePause(item.id)}
                      >
                        继续
                      </Button>
                    </Tooltip>
                  )}
                  {item.status !== 'generating' && (
                    <Tooltip title="取消任务">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleCancel(item.id)}
                      >
                        取消
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              </div>
            </div>
          </List.Item>
        )}
      />

      {/* 底部提示 */}
      {queue.length === 0 && (
        <div className="queue-empty">
          <ClockCircleOutlined style={{ fontSize: 48, color: '#9ca3af' }} />
          <p>队列为空</p>
        </div>
      )}
    </Drawer>
  )
}
