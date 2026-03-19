import { useState } from 'react'
import { Button, Drawer, Input, Select, Space, Card, Badge, Slider, Switch, message } from 'antd'
import {
  PictureOutlined,
  HistoryOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CloseOutlined,
  SoundOutlined,
} from '@ant-design/icons'
import { GalleryScene } from '@/components/GalleryScene'
import { HistoryModal } from '@/components/HistoryModal'
import { QueueDrawer } from '@/components/QueueDrawer'
import { useImageGeneration } from '@/hooks/useImageGeneration'
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic'
import { useCameraControl } from '@/hooks/useCameraControl'
import { STYLE_PRESETS } from '@/services/imageGen'
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
// 背景音乐源列表（按优先级排序）
// 1. 本地文件（需手动添加到 public/audio/background.mp3）
// 2. 在线备选源
const BACKGROUND_MUSIC_SOURCES = [
  '/audio/background.mp3',
  // 备选在线源（SoundHelix 免费音乐，支持 CORS）
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
]

export function Gallery() {
  // 使用图片生成 Hook
  const { queue, history, submitGeneration } = useImageGeneration()

  // 背景音乐 Hook
  const backgroundMusic = useBackgroundMusic(BACKGROUND_MUSIC_SOURCES)

  // 相机控制 Hook
  const cameraControl = useCameraControl()

  // AI 生成面板状态
  const [generatePanelOpen, setGeneratePanelOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<string>('realistic')

  // 环境设置状态
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false)
  const [brightness, setBrightness] = useState(50)
  const [musicEnabled, setMusicEnabled] = useState(false)

  // 生成历史状态
  const [historyVisible, setHistoryVisible] = useState(false)

  // 生成队列状态
  const [queueDrawerOpen, setQueueDrawerOpen] = useState(false)

  // 处理音乐开关
  const handleMusicToggle = (enabled: boolean) => {
    setMusicEnabled(enabled)
    if (enabled) {
      backgroundMusic.play()
    } else {
      backgroundMusic.pause()
    }
  }

  // 艺术风格选项（从 STYLE_PRESETS 生成）
  const styleOptions = [
    { label: '写实风格', value: 'realistic' },
    { label: '赛博朋克', value: 'cyberpunk' },
    { label: '水彩画', value: 'watercolor' },
    { label: '油画', value: 'oilPainting' },
    { label: '素描', value: 'sketch' },
    { label: '动漫', value: 'anime' },
    { label: '抽象', value: 'abstract' },
    { label: '印象派', value: 'impressionism' },
  ]

  // 生成作品
  const handleGenerate = () => {
    if (!prompt.trim()) {
      message.warning('请输入图片描述')
      return
    }

    const styleLabel = styleOptions.find(s => s.value === selectedStyle)?.label || selectedStyle

    submitGeneration({
      prompt: prompt.trim(),
      style: selectedStyle,
      styleLabel,
    })

    message.success('已加入生成队列')
    setPrompt('') // 清空输入
  }

  return (
    <div className="gallery-container">
      {/* ==================== 3D 画廊场景 ==================== */}
      <div className="gallery-scene">
        <GalleryScene currentView={cameraControl.currentView} />
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
            <Button icon={<HistoryOutlined />} onClick={() => setHistoryVisible(true)}>
              历史记录
            </Button>

            {/* 环境设置按钮 */}
            <Button icon={<SettingOutlined />} onClick={() => setSettingsPanelOpen(true)}>
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
          {!prompt.trim() && <div className="hint-text">请输入作品描述以启用生成按钮</div>}
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
              <label>
                <SoundOutlined /> 启用音乐{' '}
                <Switch
                  checked={musicEnabled}
                  onChange={handleMusicToggle}
                  disabled={!backgroundMusic.isReady}
                />
              </label>
            </div>
            {musicEnabled && (
              <div className="setting-item">
                <label>音量</label>
                <Slider
                  min={0}
                  max={100}
                  value={backgroundMusic.volume}
                  onChange={backgroundMusic.setVolume}
                  style={{ flex: 1, margin: '0 12px' }}
                />
                <span className="setting-value">{backgroundMusic.volume}%</span>
              </div>
            )}
            {backgroundMusic.isLoading && (
              <div className="music-status" style={{ color: '#888', fontSize: '12px' }}>
                音乐加载中...
              </div>
            )}
            {backgroundMusic.isError && (
              <div className="music-status" style={{ color: '#ff4d4f', fontSize: '12px' }}>
                {backgroundMusic.errorMessage}
              </div>
            )}
          </div>

          {/* 视角控制 */}
          <div className="setting-section">
            <h3>🎥 视角控制</h3>
            <div className="control-buttons">
              <Button block onClick={cameraControl.resetView}>
                重置视角
              </Button>
              <Button block onClick={cameraControl.setTopView}>
                俯视图
              </Button>
              <Button block onClick={cameraControl.setSideView}>
                侧视图
              </Button>
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
      {queue.length > 0 && (
        <div className="queue-indicator">
          <Badge count={queue.length} size="small">
            <Button
              type="primary"
              icon={<ClockCircleOutlined />}
              size="large"
              onClick={() => setQueueDrawerOpen(true)}
            >
              生成队列
            </Button>
          </Badge>
          <div className="queue-info">预计等待时间: {queue.length * 30} 秒</div>
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
      <QueueDrawer
        open={queueDrawerOpen}
        onClose={() => setQueueDrawerOpen(false)}
        count={queue.length}
      />
    </div>
  )
}
