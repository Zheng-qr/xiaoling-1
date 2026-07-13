// 状态机定义
export const MainState = {
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
  ENDING: 'ending'
}

// 状态转换规则
export const stateTransitions = {
  [MainState.IDLE]: {
    startListening: MainState.LISTENING,
    startThinking: MainState.THINKING,
    endTour: MainState.ENDING
  },
  [MainState.LISTENING]: {
    startThinking: MainState.THINKING,
    backToIdle: MainState.IDLE
  },
  [MainState.THINKING]: {
    startSpeaking: MainState.SPEAKING,
    backToIdle: MainState.IDLE
  },
  [MainState.SPEAKING]: {
    backToIdle: MainState.IDLE
  },
  [MainState.ENDING]: {}
}

// 控制区强度映射
export const controlIntensityMap = {
  [MainState.LISTENING]: 1.0,
  [MainState.IDLE]: 0.8,
  [MainState.THINKING]: 0.5,
  [MainState.SPEAKING]: 0.3,
  [MainState.ENDING]: 0.2
}

// 超时配置
export const TIMEOUT = {
  wsConnect: 10000,        // WebSocket连接超时 10s
  wsMessage: 60000,        // 消息间隔超时 60s
  wsHeartbeat: 35000,      // 心跳间隔 35s
  thinking: 15000,         // Thinking超时 15s（显示提示）
  thinkingForce: 30000,    // Thinking强制结束 30s
  audioSegmentGap: 10000,  // 音频段间隔 10s
  audioTotal: 120000       // 单轮最大播放 120s
}

// 状态机类
export class StateMachine {
  constructor(initialState = MainState.IDLE) {
    this.currentState = initialState
    this.listeners = []
  }

  getState() {
    return this.currentState
  }

  transition(action) {
    const transitions = stateTransitions[this.currentState]
    if (transitions && transitions[action]) {
      const newState = transitions[action]
      this.currentState = newState
      this.notify(newState)
      return newState
    }
    console.warn(`无效的状态转换: ${this.currentState} -> ${action}`)
    return this.currentState
  }

  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  notify(newState) {
    this.listeners.forEach(listener => listener(newState))
  }
}
