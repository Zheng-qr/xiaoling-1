import React from 'react'

function SpotsHeader() {
  return (
    <div style={styles.header}>
      <svg width="42" height="20" viewBox="0 0 52 24" fill="none" aria-hidden="true">
        <path d="M3 14c6 0 7-7 12-7 4 0 4 5 1 6-2 1-4-1-3-3 1-4 8-6 12-2 3 3 2 8-2 10-5 3-10 0-13-3" stroke="#B88A55" strokeWidth="2" strokeLinecap="round" />
        <path d="M29 15c5 0 6-6 10-6 3 0 4 4 1 6-2 1-4-1-3-3 1-3 7-4 10 0 2 3 0 7-5 7" stroke="#B88A55" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span style={styles.title}>本路线主要景点</span>
    </div>
  )
}

const styles = {
  header: {
    minHeight: '38px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    flexShrink: 0
  },
  title: {
    fontSize: 'clamp(24px, 2.1vw, 32px)',
    lineHeight: 1,
    fontWeight: 700,
    color: '#3C352C',
    letterSpacing: '0.04em',
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif'
  }
}

export default SpotsHeader
