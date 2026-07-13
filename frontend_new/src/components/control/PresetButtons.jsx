import React from 'react'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useAppStore } from '../../stores/appStore'

// 预设按钮配置
const PRESET_BUTTONS = {
  knowledge: [
    { label: '灵山大佛', question: '灵山大佛有多高？' },
    { label: '梵宫', question: '梵宫是什么？' },
    { label: '九龙灌浴', question: '九龙灌浴是什么表演？' },
    { label: '祥符禅寺', question: '祥符禅寺的历史？' },
    { label: '五印坛城', question: '五印坛城是什么？' },
    { label: '百子戏弥勒', question: '百子戏弥勒在哪里？' }
  ],
  route: [
    { label: '普通路线', question: '推荐普通路线' },
    { label: '历史文化路线', question: '推荐历史文化路线' },
    { label: '亲子路线', question: '推荐亲子路线' },
    { label: '自然风光路线', question: '推荐自然风光路线' }
  ]
}

function PresetButtons({ onEndTour }) {
  const { sendQuestion } = useWebSocket()
  const { mainState } = useAppStore()
  const isBusy = mainState === 'speaking' || mainState === 'thinking'

  const handleClick = (question) => {
    if (!isBusy) {
      sendQuestion(question)
    }
  }

  return (
    <div style={styles.container}>
      {/* 拖拽手柄 */}
      <div style={styles.dragHandle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
        <span style={styles.dragText}>拖拽移动</span>
      </div>

      {/* 知识类按钮 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>知识问答</div>
        <div style={styles.buttonGrid}>
          {PRESET_BUTTONS.knowledge.map((btn, index) => (
            <button
              key={index}
              style={{
                ...styles.button,
                ...styles.knowledgeButton
              }}
              onClick={() => handleClick(btn.question)}
              disabled={isBusy}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 路线类按钮 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>路线推荐</div>
        <div style={styles.buttonGrid}>
          {PRESET_BUTTONS.route.map((btn, index) => (
            <button
              key={index}
              style={{
                ...styles.button,
                ...styles.routeButton
              }}
              onClick={() => handleClick(btn.question)}
              disabled={isBusy}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 结束导览按钮 */}
      <div style={styles.section}>
        <button
          style={{
            ...styles.button,
            ...styles.endButton
          }}
          onClick={onEndTour}
        >
          结束导览
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    background: 'rgba(249, 245, 234, 0.95)',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(131, 102, 68, 0.15)',
    border: '1px solid rgba(215, 166, 123, 0.3)',
    backdropFilter: 'blur(10px)',
    minWidth: '280px'
  },
  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 0',
    color: '#8B8578',
    cursor: 'grab',
    userSelect: 'none',
    borderBottom: '1px solid rgba(215, 166, 123, 0.2)',
    paddingBottom: '8px'
  },
  dragText: {
    fontSize: '12px',
    color: '#8B8578'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#6E9186',
    marginBottom: '4px'
  },
  buttonGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  button: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    transition: 'all 200ms ease',
    fontFamily: '"HarmonyOS Sans SC", "Noto Sans SC", sans-serif'
  },
  knowledgeButton: {
    background: 'rgba(217, 106, 50, 0.1)',
    color: '#A9471F',
    border: '1px solid rgba(217, 106, 50, 0.2)'
  },
  routeButton: {
    background: 'rgba(122, 155, 121, 0.1)',
    color: '#6E9186',
    border: '1px solid rgba(122, 155, 121, 0.2)'
  },
  endButton: {
    background: 'rgba(139, 133, 120, 0.1)',
    color: '#6E685C',
    border: '1px solid rgba(139, 133, 120, 0.2)',
    width: '100%'
  }
}

export default PresetButtons
