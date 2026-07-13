import { useCallback, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { useMessageStore } from '../stores/messageStore'
import { useRouteStore } from '../stores/routeStore'

const API_BASE = 'http://localhost:3001'

export function useApi() {
  const [isLoading, setIsLoading] = useState(false)

  const {
    startThinking,
    stopThinking,
    setCurrentResponseId,
    openPanel,
    transitionTo
  } = useAppStore()

  const { addMessage } = useMessageStore()

  const { enterRouteMode } = useRouteStore()

  // 发送问题
  const sendQuestion = useCallback(async (content) => {
    if (!content || isLoading) return

    setIsLoading(true)
    const responseId = `resp_${Date.now()}`

    // 添加用户消息
    addMessage({ role: 'user', content, responseId })
    setCurrentResponseId(responseId)

    // 进入思考状态
    startThinking()
    transitionTo('thinking')

    try {
      // 调用后端 API
      const response = await fetch(`${API_BASE}/api/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, responseId })
      })

      const data = await response.json()
      console.log('[API] 收到响应:', data)

      // 处理响应
      if (data.type === 'route_guidance') {
        // 路线导览模式
        addMessage({ role: 'assistant', content: `为您推荐${data.payload.routeTitle}`, responseId: data.responseId })
        enterRouteMode(data.payload)
      } else if (data.type === 'knowledge') {
        // 知识卡片
        addMessage({ role: 'assistant', content: data.content, responseId: data.responseId })
        openPanel(data.responseId, 'seg_001', 'knowledge', data.payload)
      }

      // 停止思考，进入空闲状态
      stopThinking()
      transitionTo('idle')
    } catch (error) {
      console.error('[API] 请求失败:', error)
      addMessage({ role: 'assistant', content: '抱歉，请求失败，请稍后重试。', responseId })
      stopThinking()
      transitionTo('idle')
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  // 结束导览
  const endTour = useCallback(() => {
    // 重置所有状态
    useAppStore.getState().closePanel(false)
    useAppStore.getState().stopThinking()
    useAppStore.getState().transitionTo('idle')
    useRouteStore.getState().exitRouteMode()

    // 5秒后显示满意度评分
    setTimeout(() => {
      useAppStore.getState().showSatisfactionCard()
    }, 5000)
  }, [])

  return {
    sendQuestion,
    endTour,
    isLoading
  }
}
