import { useState, useRef, useEffect, useCallback } from 'react'

type MusicStatus = 'loading' | 'ready' | 'error'

/**
 * 背景音乐 Hook
 *
 * 功能：
 * - 播放/暂停控制
 * - 音量调节
 * - 循环播放
 * - 自动暂停（页面不可见时）
 * - 支持多个音频源（主备切换）
 */
export function useBackgroundMusic(sources: string[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3) // 默认 30% 音量
  const [status, setStatus] = useState<MusicStatus>('loading')
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  // 初始化音频
  useEffect(() => {
    if (sources.length === 0) {
      setStatus('error')
      setErrorMessage('未配置音频源')
      return
    }

    const audio = new Audio()
    audio.loop = true
    audio.volume = volume
    audioRef.current = audio

    let isCancelled = false

    const tryLoadSource = (index: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (index >= sources.length) {
          reject(new Error('所有音频源都加载失败'))
          return
        }

        const src = sources[index]
        audio.src = src
        audio.load()

        const handleCanPlay = () => {
          if (!isCancelled) {
            setStatus('ready')
            setCurrentSourceIndex(index)
            setErrorMessage('')
            resolve()
          }
          cleanup()
        }

        const handleError = () => {
          cleanup()
          // 尝试下一个源
          if (index + 1 < sources.length) {
            tryLoadSource(index + 1).then(resolve).catch(reject)
          } else {
            reject(new Error('所有音频源都加载失败'))
          }
        }

        const cleanup = () => {
          audio.removeEventListener('canplaythrough', handleCanPlay)
          audio.removeEventListener('error', handleError)
        }

        audio.addEventListener('canplaythrough', handleCanPlay)
        audio.addEventListener('error', handleError)

        // 设置超时（10秒）
        setTimeout(() => {
          if (audio.readyState < 3) {
            cleanup()
            handleError()
          }
        }, 10000)
      })
    }

    tryLoadSource(0).catch((err) => {
      if (!isCancelled) {
        console.error('音频加载失败:', err)
        setStatus('error')
        setErrorMessage('音频加载失败，请检查网络或添加本地音频文件')
      }
    })

    return () => {
      isCancelled = true
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [sources.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  // 页面可见性变化时自动暂停/恢复
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        audioRef.current?.pause()
      } else if (!document.hidden && isPlaying) {
        audioRef.current?.play().catch(() => {})
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isPlaying])

  // 更新音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // 播放
  const play = useCallback(async () => {
    if (!audioRef.current || status !== 'ready') return

    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('播放失败:', error)
    }
  }, [status])

  // 暂停
  const pause = useCallback(() => {
    if (!audioRef.current) return

    audioRef.current.pause()
    setIsPlaying(false)
  }, [])

  // 切换播放状态
  const toggle = useCallback(async () => {
    if (isPlaying) {
      pause()
    } else {
      await play()
    }
  }, [isPlaying, play, pause])

  // 设置音量（0-100 转换为 0-1）
  const setVolumePercent = useCallback((percent: number) => {
    setVolume(Math.max(0, Math.min(100, percent)) / 100)
  }, [])

  return {
    isPlaying,
    isReady: status === 'ready',
    isLoading: status === 'loading',
    isError: status === 'error',
    errorMessage,
    volume: Math.round(volume * 100),
    currentSourceIndex,
    play,
    pause,
    toggle,
    setVolume: setVolumePercent,
  }
}
