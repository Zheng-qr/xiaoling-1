import React, { useEffect, useState, useRef } from 'react'
import { useAppStore } from './stores/appStore'
import { useRouteStore } from './stores/routeStore'
import { useWebSocket } from './hooks/useWebSocket'
import { useAudioPlayer } from './hooks/useAudioPlayer'
import { useIsMobile } from './hooks/useIsMobile'
import StageLayout from './components/StageLayout'
import RouteGuideLayout from './components/route/RouteGuideLayout'
import MobileStageLayout from './components/mobile/MobileStageLayout'
import SpotDetailLayout from './components/scenic/SpotDetailLayout'

const SATISFACTION_DELAY = 5000

function App() {
  const { mainState, pendingSatisfaction, clearPendingSatisfaction, selectedSpotId } = useAppStore()
  const { isRouteMode } = useRouteStore()
  const isMobile = useIsMobile()

  // 初始化 WebSocket 和 AudioPlayer
  const { sendQuestion, sendSatisfaction } = useWebSocket()
  useAudioPlayer()

  // 满意度卡片
  const [showCard, setShowCard] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (pendingSatisfaction && mainState === 'idle') {
      timerRef.current = setTimeout(() => setShowCard(true), SATISFACTION_DELAY)
    } else {
      clearTimeout(timerRef.current)
      setShowCard(false)
    }
    return () => clearTimeout(timerRef.current)
  }, [pendingSatisfaction, mainState])

  const handleSat = (score) => {
    console.log('[App] Satisfaction:', score, pendingSatisfaction)
    // 发送满意度到后端
    if (pendingSatisfaction) {
      sendSatisfaction(score, pendingSatisfaction.session_id, pendingSatisfaction.message_id)
    }
    setShowCard(false)
    clearPendingSatisfaction()
  }

  return (
    <div className="app">
      {isMobile ? (
        <MobileStageLayout
          sendQuestion={sendQuestion}
          sendSatisfaction={sendSatisfaction}
        />
      ) : isRouteMode ? (
        <RouteGuideLayout />
      ) : selectedSpotId ? (
        <SpotDetailLayout
          sendQuestion={sendQuestion}
          sendSatisfaction={sendSatisfaction}
        />
      ) : (
        <StageLayout
          sendQuestion={sendQuestion}
          sendSatisfaction={sendSatisfaction}
        />
      )}

      {showCard && pendingSatisfaction && (
        <div style={styles.satisfactionCard}>
          <div style={styles.satTitle}>这次回答有帮助吗？</div>
          <div style={styles.satButtons}>
            <button
              style={{ ...styles.satBtn, ...styles.satLike }}
              onClick={() => handleSat(5)}
            >满意</button>
            <button
              style={{ ...styles.satBtn, ...styles.satDislike }}
              onClick={() => handleSat(1)}
            >不满意</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  satisfactionCard: {
    position: 'fixed',
    bottom: '100px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '18px 28px',
    borderRadius: '12px',
    zIndex: 60,
    textAlign: 'center',
    background: 'rgba(255, 251, 242, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(215, 166, 123, 0.3)',
    boxShadow: '0 8px 32px rgba(131, 102, 68, 0.15)',
  },
  satTitle: {
    fontSize: '15px',
    color: '#3C352C',
    marginBottom: '14px',
  },
  satButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  satBtn: {
    padding: '8px 20px',
    borderRadius: '8px',
    border: '1px solid #D9C7A8',
    background: 'transparent',
    color: '#6E685C',
    fontSize: '14px',
    cursor: 'pointer',
  },
  satLike: {
    borderColor: '#7A9B79',
    color: '#7A9B79',
  },
  satDislike: {
    borderColor: '#D96A32',
    color: '#D96A32',
  },
}

export default App
