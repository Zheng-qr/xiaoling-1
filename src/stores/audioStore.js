import { create } from 'zustand'

/**
 * AudioStore — 流式 PCM 播放
 * Real: binary → Float32 → enqueue → prebuffer → play
 */
const useAudioStore = create((set, get) => ({
  isPlaying: false,
  isPrebuffering: false,
  analyserNode: null,

  // 流式队列
  audioQueue: [],
  minPrebuffer: 5,

  // 流式标记
  streamEndReceived: false,

  // 收到 binary → PCM16 → Float32 入队
  enqueueAudioChunk: (pcmData) => {
    const int16 = new Int16Array(pcmData)
    const float32 = new Float32Array(int16.length)
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768
    }
    set((s) => ({
      audioQueue: [...s.audioQueue, float32],
    }))
  },

  dequeueChunk: () => {
    const { audioQueue } = get()
    if (audioQueue.length === 0) return null
    const chunk = audioQueue[0]
    set({ audioQueue: audioQueue.slice(1) })
    return chunk
  },

  setPlaying: (v) => set({ isPlaying: v }),
  setPrebuffering: (v) => set({ isPrebuffering: v }),
  setAnalyserNode: (node) => set({ analyserNode: node }),
  markStreamEnd: () => set({ streamEndReceived: true }),

  reset: () => set((s) => ({
    isPlaying: false,
    isPrebuffering: false,
    audioQueue: [],
    streamEndReceived: false,
    analyserNode: s.analyserNode,
  })),
}))

export { useAudioStore }