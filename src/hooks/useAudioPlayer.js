import { useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '../stores/appStore'
import { useAudioStore } from '../stores/audioStore'

const SAMPLE_RATE = 24000

let audioCtx = null
let analyserNode = null

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

    const { stopThinking, transitionTo } = useAppStore.getState()
    stopThinking()
    transitionTo('speaking')
    useAudioStore.getState().setPlaying(true)
    console.log('[AudioPlayer] → SPEAKING')

    playNextChunk()
  }, [playNextChunk])

  const finishPlayback = useCallback(() => {
    playingRef.current = false
    useAudioStore.getState().setPlaying(false)
    useAppStore.getState().transitionTo('idle')
    console.log('[AudioPlayer] → IDLE')
  }, [])

  // 监听 audioQueue → 预缓冲达标自动播放
  useEffect(() => {
    const unsub = useAudioStore.subscribe((state) => {
      if (!playingRef.current && !state.isPrebuffering) {
        if (state.audioQueue.length >= state.minPrebuffer) {
          console.log(`[AudioPlayer] Prebuffer ready (${state.audioQueue.length} chunks) → start`)
          startStreamingPlayback()
        }
      }
    })
    return unsub
  }, [startStreamingPlayback])
}