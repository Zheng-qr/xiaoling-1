import { useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '../stores/appStore'
import { useMessageStore } from '../stores/messageStore'
import { useAudioStore } from '../stores/audioStore'
import { useRouteStore } from '../stores/routeStore'
import { WebSocketClient } from '../utils/websocket'

// 真实后端 WebSocket 地址
const WS_URL = 'ws://localhost:8000/ws/digital_human_client'

export function useWebSocket() {
  const wsClientRef = useRef(null)

  const {
    startThinking,
    stopThinking,
    transitionTo,
    setEmotion,
    setPendingSatisfaction,
    clearPendingSatisfaction,
    setCurrentResponseId,
    openPanel,
  } = useAppStore()

  const {
    addToken,
    addMessage,
    reset,
    enqueueSentence,
    setStreamEndReceived,
  } = useMessageStore()

  const { enqueueAudioChunk, markStreamEnd, reset: resetAudio } = useAudioStore()

  // 初始化 WebSocket
  useEffect(() => {
    wsClientRef.current = new WebSocketClient(WS_URL)

    wsClientRef.current.onOpen = () => {
      console.log('[WS] Connected to backend')
    }

    wsClientRef.current.onClose = () => {
      console.log('[WS] Disconnected')
    }

    wsClientRef.current.onMessage = (data) => {
      handleMessage(data)
    }

    wsClientRef.current.connect()

    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.disconnect()
      }
    }
  }, [])

  // 处理后端消息
  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'connected':
        console.log('[WS] Connection confirmed:', data.message)
        break

      case 'stream_start':
        console.log('[WS] stream_start')
        break

      case 'intent':
        console.log('[WS] intent:', data.intent, data.confidence)
        break

      case 'token':
        // 累积 token 内容，过滤情绪标签
        const content = data.content.replace(/\[emotion=\w+\]/g, '')
        addToken(content)
        break

      case 'emotion':
        setEmotion(data.emotion || data.content)
        console.log('[WS] emotion:', data.emotion)
        break

      case 'sentence':
        console.log('[WS] sentence:', data.content?.substring(0, 30))
        enqueueSentence({
          segmentId: data.segmentId || data.segment_id,
          content: data.content,
          emotion: data.emotion,
          duration: data.duration,
          durationMs: data.durationMs || data.duration_ms,
          audioDuration: data.audioDuration || data.audio_duration,
          audioDurationMs: data.audioDurationMs || data.audio_duration_ms,
        })
        break

      case 'panel_open':
        if (data.responseId) {
          setCurrentResponseId(data.responseId)
        }
        openPanel(
          data.responseId,
          data.segmentId || 'seg_001',
          data.panelType || data.typeName || 'knowledge',
          data.payload || null
        )
        break

      case 'route_guidance':
        if (data.payload) {
          useRouteStore.getState().enterRouteMode(data.payload)
        }
        break

      case 'binary':
        // 收到 PCM16 音频数据
        enqueueAudioChunk(data.data)
        break

      case 'stream_end':
        markStreamEnd()
        setStreamEndReceived(true)
        console.log('[WS] stream_end')
        break

      case 'satisfaction_request':
        console.log('[WS] satisfaction:', data.session_id)
        useAppStore.getState().setPendingSatisfaction(data)
        break

      case 'pong':
        break

      case 'error':
        console.error('[WS] Error:', data.message)
        break

      default:
        break
    }
  }, [])

  // 发送问题
  const sendQuestion = useCallback((content) => {
    const { mainState } = useAppStore.getState()
    if (mainState === 'speaking' || mainState === 'thinking') {
      console.log('[WS] Busy, reject send')
      return
    }

    // 重置状态
    startThinking()
    clearPendingSatisfaction()
    reset()
    resetAudio()

    // 发送问题
    if (wsClientRef.current) {
      wsClientRef.current.send({ type: 'question', content })
    }
    addMessage({ role: 'user', content })
    console.log('[WS] Sent:', content)
  }, [])

  // 发送满意度
  const sendSatisfaction = useCallback((score, sessionId, messageId) => {
    if (wsClientRef.current) {
      wsClientRef.current.send({
        type: 'satisfaction',
        score,
        session_id: sessionId,
        message_id: messageId
      })
    }
  }, [])

  return {
    sendQuestion,
    sendSatisfaction
  }
}
