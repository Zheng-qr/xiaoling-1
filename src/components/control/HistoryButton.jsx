import React from 'react'

function HistoryButton({ onClick }) {
  return (
    <button
      style={styles.button}
      onClick={onClick}
      title="历史记录"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    </button>
  )
}

const styles = {
  button: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(255, 251, 242, 0.8)',
    border: '1px solid #D9C7A8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#6E685C',
    transition: 'all 200ms ease'
  }
}

export default HistoryButton
