import { create } from 'zustand'

export const useMessageStore = create((set, get) => ({
  // 消息历史
  messages: [],

  // 当前回答（token累积）
  fullAnswer: '',

  // 字幕状态
  previousSentence: '',
  currentSentence: '',

  // 句子队列（等待音频播放）
  sentenceQueue: [],

  // stream结束标记
  streamEndReceived: false,

  // 所有segment完成标记
  allSegmentsDone: false,

  // 添加token（不驱动字幕）
  addToken: (token) => set(state => ({
    fullAnswer: state.fullAnswer + token
  })),

  // 添加句子到队列
  enqueueSentence: (sentence) => set(state => ({
    sentenceQueue: [...state.sentenceQueue, sentence]
  })),

  // 取出句子更新字幕（音频播放时调用）
  dequeueSentence: (segmentId) => {
    const { sentenceQueue } = get()
    const index = sentenceQueue.findIndex(s => s.segmentId === segmentId)
    if (index === -1) return null
    const sentence = sentenceQueue[index]
    const newQueue = [...sentenceQueue]
    newQueue.splice(index, 1)
    set(state => ({
      sentenceQueue: newQueue,
      previousSentence: state.currentSentence,
      currentSentence: sentence.content
    }))
    return sentence
  },

  // 添加消息
  addMessage: (message) => set(state => ({
    messages: [...state.messages, message]
  })),

  // 设置当前字幕
  setCurrentSentence: (sentence) => set({ currentSentence: sentence }),

  // 标记stream结束
  setStreamEndReceived: (received) => set({ streamEndReceived: received }),

  // 标记所有segment完成
  setAllSegmentsDone: (done) => set({ allSegmentsDone: done }),

  // 完成一轮回答
  finishResponse: () => {
    const { streamEndReceived, allSegmentsDone } = get()
    if (!streamEndReceived || !allSegmentsDone) return false

    set(state => ({
      messages: [
        ...state.messages,
        { role: 'assistant', content: state.fullAnswer }
      ],
      fullAnswer: '',
      previousSentence: '',
      currentSentence: '',
      sentenceQueue: [],
      streamEndReceived: false,
      allSegmentsDone: false
    }))
    return true
  },

  // 重置状态
  reset: () => set({
    fullAnswer: '',
    previousSentence: '',
    currentSentence: '',
    sentenceQueue: [],
    streamEndReceived: false,
    allSegmentsDone: false
  })
}))
