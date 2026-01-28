import { useState } from 'react'
import { Button, Drawer, Input, Select, Space, Card, Badge, Slider, Switch } from 'antd'
import {
  PictureOutlined,
  HistoryOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { GalleryScene } from '@/components/GalleryScene'
import { HistoryModal } from '@/components/HistoryModal'
import { QueueDrawer } from '@/components/QueueDrawer'
import './Gallery.css'

const { TextArea } = Input

/**
 * 画廊主页面
 *
 * 功能：
 * 1. 3D 画廊展示（全屏）
 * 2. AI 生成面板（左侧抽屉）
 * 3. 生成队列（右下角指示器 + 详情抽屉）
 * 4. 环境设置（右侧抽屉）
 * 5. 生成历史（Modal）
 */
export function Gallery() {
  // AI 生成面板状态
  const [generatePanelOpen, setGeneratePanelOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string>('oil-painting')

  // 环境设置状态
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false)
  const [brightness, setBrightness] = useState(50)
  const [musicEnabled, setMusicEnabled] = useState(false)

  // 生成历史状态
  const [historyVisible, setHistoryVisible] = useState(false)

  // 生成队列状态
  const [queueDrawerOpen, setQueueDrawerOpen] = useState(false)
  const queueCount = 3

  // 艺术风格选项
  const styleOptions = [
    { label: '油画风格', value: 'oil-painting' },
    { label: '水彩画', value: 'watercolor' },
    { label: '像素艺术', value: 'pixel-art' },
    { label: '素描', value: 'sketch' },
    { label: '印象派', value: 'impressionism' },
    { label: '赛博朋克', value: 'cyberpunk' },
  ]

  // 生成作品
  const handleGenerate = () => {
    console.log('生成作品:', { prompt, style: selectedStyle })
    // TODO: 调用 AI 生成 API
  }

  return (
    <div className="gallery-container">
      {/* ==================== 3D 画廊场景 ==================== */}
      <div className="gallery-scene">
        <GalleryScene />
      </div>

      {/* ==================== 顶部控制栏 ==================== */}
      <div className="gallery-header">
        <div className="header-left">
          <h1 className="gallery-title">AI Art Gallery</h1>
        </div>

        <div className="header-center">
          <span className="gallery-subtitle">AI 艺术画廊</span>
        </div>

        <div className="header-right">
          <Space>
            {/* 生成历史按钮 */}
            <Button
              icon={<HistoryOutlined />}
              onClick={() => setHistoryVisible(true)}
            >
              历史记录
            </Button>

            {/* 环境设置按钮 */}
            <Button
              icon={<SettingOutlined />}
              onClick={() => setSettingsPanelOpen(true)}
            >
              环境设置
            </Button>

            {/* AI 生成按钮 */}
            <Button
              type="primary"
              icon={<PictureOutlined />}
              size="large"
              onClick={() => setGeneratePanelOpen(true)}
            >
              AI 生成
            </Button>
          </Space>
        </div>
      </div>

      {/* ==================== 左侧：AI 生成面板 ==================== */}
      <Drawer
        title={
          <Space>
            <PictureOutlined />
            <span>AI 艺术生成</span>
          </Space>
        }
        placement="left"
        size={400}
        open={generatePanelOpen}
        onClose={() => setGeneratePanelOpen(false)}
        mask={true}
        className="generate-panel"
        closeIcon={<CloseOutlined />}
      >
        <div className="generate-content">
          {/* 文本输入 */}
          <div className="form-section">
            <label className="form-label">作品描述</label>
            <TextArea
              placeholder="描述你想要生成的艺术作品..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={6}
              maxLength={500}
              showCount
            />
          </div>

          {/* 风格选择 */}
          <div className="form-section">
            <label className="form-label">艺术风格</label>
            <Select
              style={{ width: '100%' }}
              value={selectedStyle}
              onChange={setSelectedStyle}
              options={styleOptions}
              placeholder="选择艺术风格"
            />
          </div>

          {/* 尺寸说明 */}
          <div className="form-section">
            <Card size="small" className="info-card">
              <p>
                <strong>生成尺寸：</strong>1024 x 1024 px
              </p>
              <p>
                <strong>预计时间：</strong>约 30 秒
              </p>
            </Card>
          </div>

          {/* 生成按钮 */}
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            size="large"
            block
            onClick={handleGenerate}
            disabled={!prompt.trim()}
          >
            开始生成
          </Button>

          {/* 提示信息 */}
          {!prompt.trim() && (
            <div className="hint-text">请输入作品描述以启用生成按钮</div>
          )}
        </div>
      </Drawer>

      {/* ==================== 右侧：环境设置面板 ==================== */}
      <Drawer
        title={
          <Space>
            <SettingOutlined />
            <span>环境设置</span>
          </Space>
        }
        placement="right"
        size={350}
        open={settingsPanelOpen}
        onClose={() => setSettingsPanelOpen(false)}
        mask={true}
        className="settings-panel"
        closeIcon={<CloseOutlined />}
      >
        <div className="settings-content">
          {/* 灯光设置 */}
          <div className="setting-section">
            <h3>💡 灯光设置</h3>
            <div className="setting-item">
              <label>亮度</label>
              <Slider min={0} max={100} value={brightness} onChange={setBrightness} />
              <span className="setting-value">{brightness}%</span>
            </div>
          </div>

          {/* 背景音乐 */}
          <div className="setting-section">
            <h3>🎵 背景音乐</h3>
            <div className="setting-item">
              <label>启用音乐</label>
              <Switch checked={musicEnabled} onChange={setMusicEnabled} />
            </div>
          </div>

          {/* 视角控制 */}
          <div className="setting-section">
            <h3>🎥 视角控制</h3>
            <div className="control-buttons">
              <Button block>重置视角</Button>
              <Button block>俯视图</Button>
              <Button block>侧视图</Button>
            </div>
          </div>

          {/* 漫游提示 */}
          <Card size="small" className="info-card">
            <p>
              <strong>漫游控制：</strong>
            </p>
            <ul>
              <li>W/A/S/D - 前后左右移动</li>
              <li>鼠标拖拽 - 旋转视角</li>
              <li>滚轮 - 缩放</li>
            </ul>
          </Card>
        </div>
      </Drawer>

      {/* ==================== 右下角：生成队列指示器 ==================== */}
      {queueCount > 0 && (
        <div className="queue-indicator">
          <Badge count={queueCount} size="small">
            <Button
              type="primary"
              icon={<ClockCircleOutlined />}
              size="large"
              onClick={() => setQueueDrawerOpen(true)}
            >
              生成队列
            </Button>
          </Badge>
          <div className="queue-info">预计等待时间: {queueCount * 30} 秒</div>
        </div>
      )}

      {/* ==================== 底部：操作提示 ==================== */}
      <div className="gallery-footer">
        <Space>
          <span className="control-hint">
            <UserOutlined /> W/A/S/D 漫游
          </span>
          <span className="control-hint">🖱️ 拖拽旋转视角</span>
          <span className="control-hint">🔍 滚轮缩放</span>
        </Space>
      </div>

      {/* ==================== 生成历史 Modal ==================== */}
      <HistoryModal open={historyVisible} onClose={() => setHistoryVisible(false)} />

      {/* ==================== 生成队列详情抽屉 ==================== */}
      <QueueDrawer open={queueDrawerOpen} onClose={() => setQueueDrawerOpen(false)} count={queueCount} />
    </div>
  )
}
