import React from 'react'

function MapPanel({ payload, onClose }) {
  if (!payload) return null

  return (
    <div style={styles.container}>
      {/* 头部 */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <span style={styles.nextLabel}>下一站</span>
          <span style={styles.nextName}>{payload.nextLocation}</span>
        </div>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      {/* 地图主体区 */}
      {payload.mapImageUrl && (
        <div style={styles.mapArea}>
          <img
            src={payload.mapImageUrl}
            alt="路线图"
            style={styles.mapImage}
          />
        </div>
      )}

      {/* 位置说明 */}
      <div style={styles.locationDesc}>
        <p style={styles.locationText}>
          您现在位于<span style={styles.highlight}>{payload.currentLocation}</span>
        </p>
        {payload.estimatedDuration && (
          <p style={styles.duration}>
            预计用时：<span style={styles.highlight}>{payload.estimatedDuration}</span>
          </p>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '24px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  nextLabel: {
    fontSize: '14px',
    color: '#6E9186',
    fontWeight: 500
  },
  nextName: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#3C352C',
    fontFamily: '"Noto Serif SC", serif'
  },
  closeBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255, 251, 242, 0.8)',
    border: '1px solid #D9C7A8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#8B8578'
  },
  mapArea: {
    width: '100%',
    height: '280px',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '16px',
    background: '#F4F0E6',
    border: '1px solid rgba(217, 199, 168, 0.82)'
  },
  mapImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain'
  },
  locationDesc: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  locationText: {
    fontSize: '16px',
    color: '#6E685C',
    lineHeight: 1.6
  },
  highlight: {
    color: '#C95824',
    fontWeight: 600
  },
  duration: {
    fontSize: '14px',
    color: '#8B8578'
  }
}

export default MapPanel
