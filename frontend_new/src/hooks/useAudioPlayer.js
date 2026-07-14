import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../stores/appStore'
import { useAudioStore } from '../stores/audioStore'
import { useMessageStore } from '../stores/messageStore'

const SAMPLE_RATE = 24000
const SUBTITLE_HOLD_MS = 1000
const SUBTITLE_RETRY_MS = 120

let audioCtx = null
let analyserNode = null

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function getSubtitleDurationMs(sentence) {
  const explicitMs = Number(
    sentence?.durationMs
    || sentence?.duration_ms
    || sentence?.audioDurationMs
    || sentence?.audio_duration_ms
  )
  if (Number.isFinite(explicitMs) && explicitMs > 0) {
    return explicitMs
  }

  const explicitSeconds = Number(
    sentence?.duration
    || sentence?.audioDuration
    || sentence?.audio_duration
  )
  if (Number.isFinite(explicitSeconds) && explicitSeconds > 0) {
    return explicitSeconds * 1000
  }

  const charCount = Array.from(sentence?.content || '').length
  return clamp(900 + charCount * 220, 1800, 12000)
}

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    analyserNode = audioCtx.createAnalyser()
    analyserNode.fftSize = 256
    analyserNode.connect(audioCtx.destination)
    useAudioStore.getState().setAnalyserNode(analyserNode)
    console.log('[AudioPlayer] AudioContext + AnalyserNode created')
  }
  return audioCtx
}

export function useAudioPlayer() {
  const playingRef = useRef(false)
  const playbackFinishedRef = useRef(false)
  const subtitleTimerRef = useRef(null)
  const subtitleLoopRunningRef = useRef(false)

  const clearSubtitleTimer = useCallback(() => {
    if (subtitleTimerRef.current) {
      clearTimeout(subtitleTimerRef.current)
      subtitleTimerRef.current = null
    }
  }, [])

  const finishSubtitleQueue = useCallback(() => {
    const messageStore = useMessageStore.getState()
    messageStore.clearCurrentSentence()
    messageStore.setAllSegmentsDone(true)
    messageStore.finishResponse()
    subtitleLoopRunningRef.current = false
  }, [])

  const playNextSubtitle = useCallback(() => {
    const messageStore = useMessageStore.getState()
    const sentence = messageStore.dequeueNextSentence()

    if (!sentence) {
      if (messageStore.streamEndReceived) {
        finishSubtitleQueue()
        return
      }

      subtitleTimerRef.current = setTimeout(playNextSubtitle, SUBTITLE_RETRY_MS)
      return
    }

    subtitleTimerRef.current = setTimeout(() => {
      useMessageStore.getState().clearCurrentSentence()
      subtitleTimerRef.current = setTimeout(playNextSubtitle, SUBTITLE_HOLD_MS)
    }, getSubtitleDurationMs(sentence))
  }, [finishSubtitleQueue])

  const startSubtitleLoop = useCallback(() => {
    if (subtitleLoopRunningRef.current) return
    subtitleLoopRunningRef.current = true
    clearSubtitleTimer()
    playNextSubtitle()
  }, [clearSubtitleTimer, playNextSubtitle])

  const playNextChunk = useCallback(() => {
    const chunk = useAudioStore.getState().dequeueChunk()

    if (!chunk) {
      if (useAudioStore.getState().streamEndReceived) {
        console.log('[AudioPlayer] Queue empty + stream_end → playback done')
        finishPlayback()
      } else {
        console.log('[AudioPlayer] Queue empty, waiting for more data...')
        useAudioStore.getState().setPrebuffering(true)
      }
      return
    }

    useAudioStore.getState().setPrebuffering(false)

    const ctx = getAudioContext()
    const buffer = ctx.createBuffer(1, chunk.length, SAMPLE_RATE)
    buffer.getChannelData(0).set(chunk)

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(analyserNode || ctx.destination)

    source.onended = () => {
      playNextChunk()
    }

    source.start(0)
  }, [])

  const startStreamingPlayback = useCallback(() => {
    if (playingRef.current) return
    playingRef.current = true
    playbackFinishedRef.current = false

    const { stopThinking, transitionTo } = useAppStore.getState()
    stopThinking()
    transitionTo('speaking')
    useAudioStore.getState().setPlaying(true)
    console.log('[AudioPlayer] → SPEAKING')

    startSubtitleLoop()
    playNextChunk()
  }, [playNextChunk, startSubtitleLoop])

  const finishPlayback = useCallback(() => {
    if (playbackFinishedRef.current) return
    playbackFinishedRef.current = true
    playingRef.current = false
    useAudioStore.getState().setPlaying(false)
    useAppStore.getState().transitionTo('idle')
    console.log('[AudioPlayer] → IDLE')
  }, [])

  // 监听 audioQueue → 预缓冲达标自动播放
  useEffect(() => {
    const unsub = useAudioStore.subscribe((state) => {
      if (playbackFinishedRef.current && state.streamEndReceived && state.audioQueue.length === 0) {
        return
      }

      if (!playingRef.current && !state.isPrebuffering) {
        if (
          state.audioQueue.length >= state.minPrebuffer
          || (state.streamEndReceived && state.audioQueue.length > 0)
        ) {
          console.log(`[AudioPlayer] Prebuffer ready (${state.audioQueue.length} chunks) → start`)
          startStreamingPlayback()
        } else if (state.streamEndReceived && state.audioQueue.length === 0) {
          startSubtitleLoop()
          finishPlayback()
        }
      }
    })
    return unsub
  }, [finishPlayback, startStreamingPlayback, startSubtitleLoop])

  useEffect(() => {
    return () => {
      clearSubtitleTimer()
      subtitleLoopRunningRef.current = false
    }
  }, [clearSubtitleTimer])
}
