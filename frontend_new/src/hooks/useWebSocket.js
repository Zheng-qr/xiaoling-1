import { useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '../stores/appStore'
import { useMessageStore } from '../stores/messageStore'
import { useAudioStore } from '../stores/audioStore'
import { useRouteStore } from '../stores/routeStore'
import { WebSocketClient } from '../utils/websocket'
import {
  GUIDE_INTENTS,
  chooseControlIntent,
  consumeControlText,
  matchRoutePayload,
  matchSpotPayload,
} from '../utils/guideTriggers'

const WS_URL = 'ws://localhost:8000/ws/digital_human_client'

export function useWebSocket() {
  const wsClientRef = useRef(null)
  const controlTextBufferRef = useRef('')
  const controlIntentRef = useRef(null)
  const controlScanTextRef = useRef('')
  const controlTriggeredRef = useRef(false)
  const controlResponseIdRef = useRef(null)

  const {
    startThinking,
    setEmotion,
    clearPendingSatisfaction,
    setCurrentResponseId,
    openPanel,
    closePanel,
  } = useAppStore()

  const {
    addToken,
    addMessage,
    reset,
    enqueueSentence,
    setStreamEndReceived,
  } = useMessageStore()

  const { enqueueAudioChunk, markStreamEnd, reset: resetAudio } = useAudioStore()

  const resetControlSignalState = useCallback(() => {
    controlTextBufferRef.current = ''
    controlIntentRef.current = null
    controlScanTextRef.current = ''
    controlTriggeredRef.current = false
    controlResponseIdRef.current = null
  }, [])

  const setMobileGuideCard = useCallback((type, payload) => {
    useAppStore.getState().setMobileGuideCard({ type, payload })
  }, [])

  const rememberResponseId = useCallback((data) => {
    const responseId = data?.responseId || data?.response_id || useAppStore.getState().currentResponseId
    if (responseId) {
      controlResponseIdRef.current = responseId
      setCurrentResponseId(responseId)
      return responseId
    }

    if (!controlResponseIdRef.current) {
      controlResponseIdRef.current = `resp_${Date.now()}`
      setCurrentResponseId(controlResponseIdRef.current)
    }

    return controlResponseIdRef.current
  }, [setCurrentResponseId])

  const triggerGuideUiIfReady = useCallback((force = false) => {
    if (controlTriggeredRef.current || !controlIntentRef.current) return

    const text = controlScanTextRef.current

    if (controlIntentRef.current === GUIDE_INTENTS.ROUTE) {
      const payload = matchRoutePayload(text, { allowDefault: force })
      if (!payload) return

      closePanel(false)
      useRouteStore.getState().enterRouteMode(payload)
      setMobileGuideCard('route', payload)
      controlTriggeredRef.current = true
      return
    }

    if (controlIntentRef.current === GUIDE_INTENTS.SPOT) {
      const payload = matchSpotPayload(text)
      if (!payload) return

      useRouteStore.getState().exitRouteMode()
      const responseId = controlResponseIdRef.current || rememberResponseId()
      openPanel(responseId, `guide_${payload.title}`, 'knowledge', payload)
      setMobileGuideCard('spot', payload)
      controlTriggeredRef.current = true
    }
  }, [closePanel, openPanel, rememberResponseId, setMobileGuideCard])

  const consumeTokenContent = useCallback((content, data) => {
    controlTextBufferRef.current += String(content || '')

    const parsed = consumeControlText(controlTextBufferRef.current, { final: false })
    controlTextBufferRef.current = parsed.rest
    controlIntentRef.current = chooseControlIntent(controlIntentRef.current, parsed.intents)

    if (parsed.cleanText) {
      controlScanTextRef.current += parsed.cleanText
    }

    if (parsed.intents.length > 0 || parsed.cleanText) {
      rememberResponseId(data)
      triggerGuideUiIfReady(false)
    }

    return parsed.cleanText
  }, [rememberResponseId, triggerGuideUiIfReady])

  const observeSentenceControlSignal = useCallback((content, data) => {
    const parsed = consumeControlText(String(content || ''), { final: true })
    controlIntentRef.current = chooseControlIntent(controlIntentRef.current, parsed.intents)

    if (parsed.cleanText) {
      controlScanTextRef.current += parsed.cleanText
    }

    if (parsed.intents.length > 0 || parsed.cleanText) {
      rememberResponseId(data)
      triggerGuideUiIfReady(false)
    }

    return parsed
  }, [rememberResponseId, triggerGuideUiIfReady])

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'connected':
        console.log('[WS] Connection confirmed:', data.message)
        break

      case 'stream_start':
        console.log('[WS] stream_start')
        resetControlSignalState()
        rememberResponseId(data)
        break

      case 'intent':
        console.log('[WS] intent:', data.intent, data.confidence)
        break

      case 'token': {
        const rawContent = String(data.content || '').replace(/\[emotion=\w+\]/g, '')
        const content = consumeTokenContent(rawContent, data)
        if (content) addToken(content)
        break
      }

      case 'emotion':
        setEmotion(data.emotion || data.content)
        console.log('[WS] emotion:', data.emotion)
        break

      case 'sentence':
        observeSentenceControlSignal(String(data.content || '').replace(/\[emotion=\w+\]/g, ''), data)
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

      case 'panel_open': {
        const panelType = data.panelType || data.typeName || 'knowledge'
        if (data.responseId) {
          setCurrentResponseId(data.responseId)
        }
        if (panelType === 'knowledge' && data.payload) {
          setMobileGuideCard('spot', data.payload)
        }
        if (panelType === 'map' && data.payload) {
          setMobileGuideCard('route', data.payload)
        }
        openPanel(
          data.responseId,
          data.segmentId || 'seg_001',
          panelType,
          data.payload || null
        )
        break
      }

      case 'route_guidance':
        if (data.payload) {
          useRouteStore.getState().enterRouteMode(data.payload)
          setMobileGuideCard('route', data.payload)
        }
        break

      case 'binary':
        enqueueAudioChunk(data.data)
        break

      case 'stream_end': {
        if (controlTextBufferRef.current) {
          const parsed = consumeControlText(controlTextBufferRef.current, { final: true })
          controlTextBufferRef.current = ''
          controlIntentRef.current = chooseControlIntent(controlIntentRef.current, parsed.intents)
          if (parsed.cleanText) {
            controlScanTextRef.current += parsed.cleanText
            addToken(parsed.cleanText)
          }
        }

        triggerGuideUiIfReady(true)
        markStreamEnd()
        setStreamEndReceived(true)
        console.log('[WS] stream_end')
        break
      }

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
  }, [
    addToken,
    consumeTokenContent,
    enqueueAudioChunk,
    enqueueSentence,
    markStreamEnd,
    observeSentenceControlSignal,
    openPanel,
    rememberResponseId,
    resetControlSignalState,
    setCurrentResponseId,
    setEmotion,
    setMobileGuideCard,
    setStreamEndReceived,
    triggerGuideUiIfReady,
  ])

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
  }, [handleMessage])

  const sendQuestion = useCallback((content) => {
    const { mainState } = useAppStore.getState()
    if (mainState === 'speaking' || mainState === 'thinking') {
      console.log('[WS] Busy, reject send')
      return
    }

    startThinking()
    clearPendingSatisfaction()
    resetControlSignalState()
    useAppStore.getState().clearMobileGuideCard()
    reset()
    resetAudio()

    if (wsClientRef.current) {
      wsClientRef.current.send({ type: 'question', content })
    }
    addMessage({ role: 'user', content })
    console.log('[WS] Sent:', content)
  }, [
    addMessage,
    clearPendingSatisfaction,
    reset,
    resetAudio,
    resetControlSignalState,
    startThinking,
  ])

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
