import React from 'react'
import { useMessageStore } from '../../stores/messageStore'
import { useAppStore } from '../../stores/appStore'
import AnswerExpand from './AnswerExpand'

function SubtitleDock() {
  const { currentSentence, fullAnswer } = useMessageStore()
  const { answerExpanded, toggleAnswerExpand, mainState } = useAppStore()

  // 根据状态计算字幕区透明度
  const getOpacity = () => {
    switch (mainState) {
      case 'speaking':
        return 1
      case 'idle':
        return 0.8
      case 'thinking':
        return 0.6
      default:
        return 0.8
    }
  }

  return (
    <div className="subtitle-dock" style={{ ...styles.container, opacity: getOpacity() }}>
      {/* 当前句 */}
      {currentSentence && (
        <div
          style={styles.current}
          onClick={toggleAnswerExpand}
        >
          {currentSentence}
        </div>
      )}

      {/* 回答展开卡片 */}
      {answerExpanded && fullAnswer && (
        <AnswerExpand content={fullAnswer} onClose={toggleAnswerExpand} />
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'absolute',
    bottom: '120px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '52%',
    maxWidth: '64%',
    textAlign: 'center',
    zIndex: 20,
    transition: 'opacity 300ms ease'
  },
  current: {
    fontSize: '24px',
    color: '#3C352C',
    fontWeight: 600,
    lineHeight: 1.6,
    cursor: 'pointer',
    textShadow: '0 2px 8px rgba(255, 255, 255, 0.8)'
  }
}

export default SubtitleDock
