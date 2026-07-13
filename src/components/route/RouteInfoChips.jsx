import React from 'react'

function ChipIcon({ type, color }) {
  if (type === 'next') {
    return (
      <svg style={styles.iconSvg} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 20V5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M6 5h11l-2 4 2 4H6" fill={color} opacity="0.9" />
      </svg>
    )
  }

  if (type === 'time') {
    return (
      <svg style={styles.iconSvg} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" />
        <path d="M12 7v5l3 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg style={styles.iconSvg} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.4" fill={color} />
    </svg>
  )
}

function RouteInfoChips({ payload }) {
  if (!payload) return null

  const chips = [
    { type: 'pin', label: '当前位置：', value: payload.currentLocation, color: '#C95824' },
    { type: 'next', label: '推荐下一站：', value: payload.nextLocation, color: '#6E9186' },
    { type: 'time', label: '预计用时：', value: payload.estimatedDuration, color: '#C95824' }
  ]

  return (
    <div style={styles.container}>
      {chips.map((chip) => (
        <div key={chip.type} style={styles.chip}>
          <span style={styles.iconWrap}>
            <ChipIcon type={chip.type} color={chip.color} />
          </span>
          <span style={styles.label}>{chip.label}</span>
          <span style={{ ...styles.value, color: chip.color }}>{chip.value}</span>
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '14px',
    flexShrink: 0
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minWidth: 0,
    height: '50px',
    padding: '0 12px',
    background: 'rgba(255, 251, 242, 0.78)',
    borderRadius: '9px',
    border: '1.5px solid rgba(217, 199, 168, 0.9)',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.72)',
    color: '#6E685C',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  iconWrap: {
    flex: '0 0 auto',
    width: '22px',
    height: '22px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconSvg: {
    width: '22px',
    height: '22px',
    display: 'block'
  },
  label: {
    flex: '0 0 auto',
    fontSize: 'clamp(14px, 1.08vw, 17px)',
    color: '#4E463C',
    fontWeight: 700
  },
  value: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 'clamp(14px, 1.08vw, 17px)',
    fontWeight: 800
  }
}

export default RouteInfoChips
