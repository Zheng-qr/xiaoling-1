import React from 'react'

function MicButton({ state = 'idle', onClick }) {
  const isActive = state === 'listening'

  return (
    <button
      style={{
        ...styles.button,
        ...(isActive ? styles.active : {})
      }}
      onClick={onClick}
      title="语音输入"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  )
}

const styles = {
  button: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D96A32, #C95824)',
    border: '2px solid #A9471F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#FFF9F2',
    boxShadow: '0 4px 12px rgba(217, 106, 50, 0.3)',
    transition: 'all 200ms ease'
  },
  active: {
    transform: 'scale(1.1)',
    boxShadow: '0 6px 20px rgba(217, 106, 50, 0.5)'
  }
}

export default MicButton
