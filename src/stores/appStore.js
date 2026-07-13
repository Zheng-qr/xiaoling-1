import { create } from 'zustand'

// 主状态枚举
export const MainState = {
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
  ENDING: 'ending'
}

export const useAppStore = create((set, get) => ({
  // 主状态
  mainState: MainState.IDLE,

  // 叠加状态
  panelOpen: false,
  panelType: null,           // 'knowledge' | 'map' | null
  panelSegmentId: null,
  panelPayload: null,
  historyOpen: false,
  answerExpanded: false,
  controlIntensity: 1,
  thinkingVideoVisible: false,

  // 响应标识
  currentResponseId: null,
  lastCompletedResponseId: null,

  // 情绪
  currentEmotion: 'neutral',

  // 当前模型
  currentModel: 'miara', // 'miara' | 'little_panda' | 'xuancao'

  // 满意度评分
  showSatisfaction: false,
  pendingSatisfaction: null,

  // 图片放大模态框
  imageModal: {
    visible: false,
    imageUrl: null
  },

  // 手动关闭记录
  manuallyClosedSegmentIds: new Set(),

  // 状态转换
  transitionTo: (newState) => set({ mainState: newState }),

  // Thinking控制
  startThinking: () => set({
    thinkingVideoVisible: true,
    mainState: MainState.THINKING
  }),

  stopThinking: () => set({
    thinkingVideoVisible: false
  }),

  // 画轴控制
  openPanel: (responseId, segmentId, type, payload) => {
    const { manuallyClosedSegmentIds, currentResponseId } = get()
    const key = `${currentResponseId}:${segmentId}`
    if (manuallyClosedSegmentIds.has(key)) return
    set({
      panelOpen: true,
      panelType: type,
      panelSegmentId: segmentId,
      panelPayload: payload
    })
  },

  closePanel: (isManual = false) => {
    const { panelSegmentId, currentResponseId } = get()
    if (isManual) {
      const key = `${currentResponseId}:${panelSegmentId}`
      set(state => ({
        manuallyClosedSegmentIds: new Set([...state.manuallyClosedSegmentIds, key])
      }))
    }
    set({
      panelOpen: false,
      panelType: null,
      panelSegmentId: null,
      panelPayload: null
    })
  },

  // 响应生命周期清理
  clearResponse: () => set(state => ({
    lastCompletedResponseId: state.currentResponseId,
    currentResponseId: null,
    manuallyClosedSegmentIds: new Set()
  })),

  setCurrentResponseId: (id) => set({ currentResponseId: id }),

  // 控制区强度
  setControlIntensity: (intensity) => set({ controlIntensity: intensity }),

  // 回答展开
  toggleAnswerExpand: () => set(state => ({ answerExpanded: !state.answerExpanded })),

  // 历史记录
  toggleHistory: () => set(state => ({ historyOpen: !state.historyOpen })),

  // 设置情绪
  setEmotion: (emotion) => set({ currentEmotion: emotion }),

  // 切换模型
  switchModel: (modelName) => set({ currentModel: modelName }),

  // 满意度控制
  setPendingSatisfaction: (data) => set({ pendingSatisfaction: data }),
  clearPendingSatisfaction: () => set({ pendingSatisfaction: null }),
  showSatisfactionCard: () => set({ showSatisfaction: true }),
  hideSatisfactionCard: () => set({ showSatisfaction: false }),

  // 图片放大控制
  openImageModal: (imageUrl) => set({
    imageModal: { visible: true, imageUrl }
  }),
  closeImageModal: () => set({
    imageModal: { visible: false, imageUrl: null }
  })
}))
