import React from 'react'

function MapHeader({ title = '推荐游览路线' }) {
  return (
    <div style={styles.header}>
      <svg width="46" height="22" viewBox="0 0 52 24" fill="none" aria-hidden="true">
        <path d="M3 14c6 0 7-7 12-7 4 0 4 5 1 6-2 1-4-1-3-3 1-4 8-6 12-2 3 3 2 8-2 10-5 3-10 0-13-3" stroke="#B88A55" strokeWidth="2" strokeLinecap="round" />
        <path d="M29 15c5 0 6-6 10-6 3 0 4 4 1 6-2 1-4-1-3-3 1-3 7-4 10 0 2 3 0 7-5 7" stroke="#B88A55" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span style={styles.title}>{title}</span>
    </div>
  )
}

const styles = {
  header: {
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
    flexShrink: 0
  },
  title: {
    fontSize: 'clamp(28px, 2.35vw, 38px)',
    lineHeight: 1,
    fontWeight: 700,
    color: '#2F281F',
    letterSpacing: '0.04em',
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif'
  }
}

export default MapHeader
