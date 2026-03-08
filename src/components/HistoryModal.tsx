import { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Modal, List, Tag, Space, Image, Empty, Tooltip, Button } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import type { RootState } from '@/stores/store'
import { useImageGeneration } from '@/hooks/useImageGeneration'
import type { GenerationStatus } from '@/types/history'
import './HistoryModal.css'

interface HistoryModalProps {
  open: boolean
  onClose: () => void
}

/**
 * 生成历史 Modal 组件
 *
 * 功能：
 * - 显示所有生成历史记录
 * - 按状态筛选（全部/成功/失败/等待中）
 * - 查看大图、下载、删除
 */
export function HistoryModal({ open, onClose }: HistoryModalProps) {
  const { deleteGeneration, clearHistory } = useImageGeneration()
  const history = useSelector((state: RootState) => state.images.history)
  const [selectedTab, setSelectedTab] = useState<'all' | 'success' | 'failed' | 'pending'>('all')

  // 转换S3 URL为代理URL的辅助函数
  const convertToProxyUrl = (url: string) => {
    if (url.includes('s3.siliconflow.cn')) {
      try {
        const urlObj = new URL(url)
        return `/s3-proxy${urlObj.pathname}${urlObj.search}`
      } catch (e) {
        console.error('URL转换失败:', e)
        return url
      }
    }
    return url
  }

  // 根据选中的 tab 过滤历史记录
  const filteredHistory = useMemo(() => {
    if (selectedTab === 'all') return history

    const statusMap: Record<typeof selectedTab, GenerationStatus> = {
      all: 'success',
      success: 'success',
      failed: 'failed',
      pending: 'pending',
    }

    return history.filter(item => item.status === statusMap[selectedTab])
  }, [history, selectedTab])

  // 统计各状态数量
  const stats = useMemo(
    () => ({
      all: history.length,
      success: history.filter(i => i.status === 'success').length,
      failed: history.filter(i => i.status === 'failed').length,
      pending: history.filter(i => i.status === 'pending').length,
    }),
    [history]
  )

  // 获取状态标签
  const getStatusTag = (status: GenerationStatus) => {
    switch (status) {
      case 'success':
        return <Tag color="success">成功</Tag>
      case 'failed':
        return <Tag color="error">失败</Tag>
      case 'pending':
        return <Tag color="processing">等待中</Tag>
      case 'generating':
        return <Tag color="processing">生成中</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  // 获取状态图标
  const getStatusIcon = (status: GenerationStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'pending':
      case 'generating':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />
      default:
        return <ClockCircleOutlined />
    }
  }

  // 处理删除单个记录
  const handleDelete = (id: string) => {
    deleteGeneration(id)
  }

  // 处理清空所有
  const handleClearAll = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？此操作不可恢复。',
      onOk: () => {
        clearHistory()
      },
    })
  }

  // 处理下载
  const handleDownload = (url: string, prompt: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `AI-Art-${prompt.slice(0, 20)}.png`
    link.click()
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <ClockCircleOutlined />
            <span>生成历史</span>
          </Space>
          <Button size="small" danger onClick={handleClearAll}>
            清空全部
          </Button>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      className="history-modal"
    >
      {/* Tab 筛选 */}
      <div className="history-tabs">
        <Space size="large">
          <span
            className={`tab-item ${selectedTab === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTab('all')}
          >
            全部 ({stats.all})
          </span>
          <span
            className={`tab-item ${selectedTab === 'success' ? 'active' : ''}`}
            onClick={() => setSelectedTab('success')}
          >
            成功 ({stats.success})
          </span>
          <span
            className={`tab-item ${selectedTab === 'failed' ? 'active' : ''}`}
            onClick={() => setSelectedTab('failed')}
          >
            失败 ({stats.failed})
          </span>
          <span
            className={`tab-item ${selectedTab === 'pending' ? 'active' : ''}`}
            onClick={() => setSelectedTab('pending')}
          >
            等待中 ({stats.pending})
          </span>
        </Space>
      </div>

      {/* 历史列表 */}
      <List
        className="history-list"
        dataSource={filteredHistory}
        locale={{
          emptyText: (
            <Empty
              description={
                selectedTab === 'all'
                  ? '暂无生成记录'
                  : `暂无${selectedTab === 'success' ? '成功' : selectedTab === 'failed' ? '失败' : '等待中'}的记录`
              }
            />
          ),
        }}
        renderItem={item => (
          <List.Item
            key={item.id}
            className="history-item"
            actions={[
              item.status === 'success' && item.imageUrl && (
                <Image
                  src={convertToProxyUrl(item.imageUrl)}
                  alt={item.prompt}
                  width={30}
                  height={30}
                  style={{ cursor: 'pointer', borderRadius: 4 }}
                  preview={{
                    mask: '查看大图',
                  }}
                />
              ),
              item.status === 'success' && item.imageUrl && (
                <Tooltip title="下载">
                  <Button
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(convertToProxyUrl(item.imageUrl!), item.prompt)}
                  />
                </Tooltip>
              ),
              <Tooltip title="删除">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(item.id)}
                />
              </Tooltip>,
            ]}
          >
            <List.Item.Meta
              avatar={<div className="history-avatar">{getStatusIcon(item.status)}</div>}
              title={
                <Space>
                  {getStatusTag(item.status)}
                  <Tag color="purple">{item.styleLabel}</Tag>
                  {item.status === 'pending' && item.queuePosition && (
                    <Tag color="orange">队列 #{item.queuePosition}</Tag>
                  )}
                </Space>
              }
              description={
                <div>
                  <div className="history-prompt">{item.prompt}</div>
                  <Space className="history-meta" separator="|">
                    <span className="history-time">{item.createdAt}</span>
                    {item.duration && <span>耗时 {item.duration} 秒</span>}
                    {item.error && <span className="history-error">{item.error}</span>}
                  </Space>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  )
}
