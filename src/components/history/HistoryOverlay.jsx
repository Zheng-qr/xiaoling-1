import React from 'react'
import { useAppStore } from '../../stores/appStore'
import HistoryChat from './HistoryChat'

function HistoryOverlay({ isMobile = false }) {
  const { toggleHistory } = useAppStore()

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={toggleHistory} />
      <div style={isMobile ? { ...styles.panel, ...styles.mobilePanel } : styles.panel}>
        {/* 头部 */}
        <div style={styles.header}>
          <h2 style={styles.title}>对话历史</h2>
          <button style={styles.backBtn} onClick={toggleHistory}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 消息列表 */}
        <HistoryChat />
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 300ms ease'
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(60, 53, 44, 0.3)',
    backdropFilter: 'blur(8px)',
    cursor: 'pointer'
  },
  panel: {
    position: 'relative',
    width: '50%',
    maxWidth: '60%',
    height: '70%',
    maxHeight: '78%',
    background: 'rgba(249, 245, 234, 0.98)',
    borderRadius: '22px',
    border: '1.5px solid #D7A67B',
    boxShadow: '0 12px 28px rgba(131, 102, 68, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  mobilePanel: {
    width: 'calc(100vw - 28px)',
    maxWidth: 'calc(100vw - 28px)',
    height: 'min(78dvh, 620px)',
    maxHeight: '78dvh',
    borderRadius: '18px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(215, 166, 123, 0.3)'
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#3C352C',
    fontFamily: '"Noto Serif SC", serif'
  },
  backBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255, 251, 242, 0.8)',
    border: '1px solid #D9C7A8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#6E685C'
  }
}

export default HistoryOverlay
