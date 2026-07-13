import React from 'react'

function RouteSummaryStrip({ payload }) {
  if (!payload?.routeSummary) return null

  const stops = payload.routeSummary
    .split('→')
    .map((item) => item.trim())
    .filter(Boolean)

  return (
    <div style={styles.container}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={styles.flag}>
        <path d="M5 21V4" stroke="#B88A55" strokeWidth="2" strokeLinecap="round" />
        <path d="M6 4h11l-2.2 4L17 12H6V4Z" fill="#B88A55" />
      </svg>
      <span style={styles.label}>当前路线将依次经过：</span>
      <div style={styles.stops}>
        {stops.map((stop, index) => (
          <React.Fragment key={`${stop}-${index}`}>
            <span style={index === 0 ? styles.stopMuted : styles.stop}>{stop}</span>
            {index < stops.length - 1 && <span style={styles.arrow}>→</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: '62px',
    marginTop: '18px',
    padding: '0 clamp(14px, 1.6vw, 22px)',
    background: 'rgba(255, 251, 242, 0.78)',
    border: '1.5px solid rgba(217, 199, 168, 0.88)',
    borderRadius: '13px',
    flexShrink: 0,
    overflow: 'hidden'
  },
  flag: {
    flex: '0 0 auto'
  },
  label: {
    flex: '0 0 auto',
    fontSize: 'clamp(14px, 1.05vw, 17px)',
    color: '#4E463C',
    fontWeight: 600,
    whiteSpace: 'nowrap'
  },
  stops: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  stop: {
    flex: '0 0 auto',
    color: '#C95824',
    fontSize: 'clamp(15px, 1.2vw, 19px)',
    fontWeight: 800,
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  stopMuted: {
    flex: '0 0 auto',
    color: '#A9471F',
    fontSize: 'clamp(15px, 1.2vw, 19px)',
    fontWeight: 700,
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  arrow: {
    flex: '0 0 auto',
    color: '#3C352C',
    fontSize: 'clamp(14px, 1.05vw, 18px)',
    fontWeight: 700,
    opacity: 0.72
  }
}

export default RouteSummaryStrip
