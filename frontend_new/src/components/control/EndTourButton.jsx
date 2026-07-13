import React from 'react'

function EndTourButton({ onClick }) {
  return (
    <button
      style={styles.button}
      onClick={onClick}
      title="结束导览"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="9" x2="15" y2="15" />
        <line x1="15" y1="9" x2="9" y2="15" />
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

export default EndTourButton
