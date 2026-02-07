import { useSelector } from 'react-redux'
import { Drawer, List, Progress, Tag, Space, Button, Card, Tooltip } from 'antd'
import {
  PauseCircleOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import type { RootState } from '@/stores/store'
import { useImageGeneration } from '@/hooks/useImageGeneration'
import './QueueDrawer.css'

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
 * - 实时更新进度
 * - 支持取消任务
 * - 显示预计等待时间
 */
export function QueueDrawer({ open, onClose, count }: QueueDrawerProps) {
  const { cancelGeneration } = useImageGeneration()
  const queue = useSelector((state: RootState) =>
    state.images.history.filter(
      (t) => t.status === 'pending' || t.status === 'generating'
    )
  )

  // 获取状态标签
  const getStatusTag = (status: string) => {
    switch (status) {
      case 'generating':
        return <Tag color="processing">生成中</Tag>
      case 'pending':
        return <Tag color="default">等待中</Tag>
      case 'failed':
        return <Tag color="error">失败</Tag>
      default:
        return <Tag color="default">{status}</Tag>
    }
  }

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generating':
        return <ClockCircleOutlined style={{ color: '#52c41a' }} />
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#9ca3af' }} />
      case 'failed':
        return <PauseCircleOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <ClockCircleOutlined />
    }
  }

  // 处理取消
  const handleCancel = (id: string) => {
    cancelGeneration(id)
  }

  // 计算总预计时间
  const totalEta = queue.reduce((sum, item) => {
    const remainingProgress = 100 - item.progress
    return sum + (remainingProgress / 100) * 30
  }, 0)

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
            {Math.floor(totalEta / 60)} 分 {Math.round(totalEta % 60)} 秒
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">正在生成</span>
          <span className="summary-value">
            {queue.filter((i) => i.status === 'generating').length} 个
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">等待中</span>
          <span className="summary-value">
            {queue.filter((i) => i.status === 'pending').length} 个
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
                    percent={Math.round(item.progress)}
                    status="active"
                    strokeColor="#3b82f6"
                    size="small"
                  />
                  <span className="progress-text">
                    进度 {Math.round(item.progress)}%
                  </span>
                </div>
              )}

              {item.status === 'pending' && (
                <div className="queue-progress">
                  <span className="waiting-text">⏳ 等待中...</span>
                </div>
              )}

              {item.status === 'failed' && item.error && (
                <div className="queue-error">
                  <span className="error-text">❌ {item.error}</span>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="queue-actions">
                <Space>
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
