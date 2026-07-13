import React, { useMemo } from 'react'
import { useAppStore } from '../../stores/appStore'

function MobileMapBlock({ payload }) {
  const { openImageModal } = useAppStore()

  const stops = useMemo(() => getStops(payload), [payload])
  if (!payload) return null

  const imageUrl = payload.mapImageUrl || payload.mapImage || payload.imageUrl
  const title = payload.routeTitle || payload.title || '路线导览'
  const nextLocation = payload.nextLocation
  const currentLocation = payload.currentLocation
  const estimatedDuration = payload.estimatedDuration || payload.duration

  if (!imageUrl && !nextLocation && !currentLocation && !estimatedDuration && stops.length === 0) {
    return null
  }

  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <span style={styles.eyebrow}>路线地图</span>
        <h2 style={styles.title}>{title}</h2>
      </div>

      {imageUrl && (
        <button
          type="button"
          style={styles.mapButton}
          onClick={() => openImageModal(imageUrl)}
          aria-label="查看路线地图"
        >
          <img src={imageUrl} alt={title} style={styles.mapImage} />
        </button>
      )}

      <div style={styles.infoGrid}>
        {nextLocation && (
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>下一站</span>
            <strong style={styles.infoValue}>{nextLocation}</strong>
          </div>
        )}
        {estimatedDuration && (
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>预计用时</span>
            <strong style={styles.infoValue}>{estimatedDuration}</strong>
          </div>
        )}
      </div>

      {currentLocation && (
        <p style={styles.current}>当前位置：<strong>{currentLocation}</strong></p>
      )}

      {stops.length > 0 && (
        <div style={styles.stops}>
          {stops.map((stop, index) => (
            <React.Fragment key={`${stop}-${index}`}>
              <span style={index === 0 ? styles.stopMuted : styles.stop}>{stop}</span>
              {index < stops.length - 1 && <span style={styles.arrow}>→</span>}
            </React.Fragment>
          ))}
        </div>
      )}
    </section>
  )
}

function getStops(payload) {
  if (!payload) return []

  if (payload.routeSummary) {
    return String(payload.routeSummary)
      .split(/\s*(?:→|->|>|,|，)\s*/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (Array.isArray(payload.stops)) {
    return payload.stops.map(String).filter(Boolean)
  }

  if (Array.isArray(payload.spots)) {
    return payload.spots
      .map((spot) => spot.spotName || spot.name || spot.title)
      .filter(Boolean)
  }

  return []
}

const styles = {
  card: {
    width: '100%',
    marginTop: '12px',
    padding: '12px',
    borderRadius: '16px',
    background: 'rgba(255, 251, 242, 0.88)',
    border: '1px solid rgba(215, 166, 123, 0.3)',
    boxShadow: '0 10px 22px rgba(131, 102, 68, 0.1)',
    overflow: 'hidden',
  },
  header: {
    marginBottom: '10px',
  },
  eyebrow: {
    color: '#6E9186',
    fontSize: '12px',
    fontWeight: 800,
  },
  title: {
    margin: '3px 0 0',
    color: '#3C352C',
    fontSize: '18px',
    lineHeight: 1.35,
    fontWeight: 800,
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", serif',
  },
  mapButton: {
    display: 'block',
    width: '100%',
    height: 'min(48vw, 220px)',
    minHeight: '152px',
    padding: 0,
    overflow: 'hidden',
    borderRadius: '12px',
    background: '#F4F0E6',
    border: '1px solid rgba(217, 199, 168, 0.82)',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'contain',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
    marginTop: '10px',
  },
  infoItem: {
    minWidth: 0,
    padding: '9px 10px',
    borderRadius: '12px',
    background: 'rgba(122, 155, 121, 0.1)',
  },
  infoLabel: {
    display: 'block',
    color: '#6E685C',
    fontSize: '12px',
    marginBottom: '3px',
  },
  infoValue: {
    display: 'block',
    minWidth: 0,
    color: '#C95824',
    fontSize: '15px',
    lineHeight: 1.35,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  current: {
    margin: '10px 2px 0',
    color: '#5F574B',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  stops: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '10px',
    padding: '9px 10px',
    borderRadius: '12px',
    background: 'rgba(255, 251, 242, 0.72)',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  stop: {
    flex: '0 0 auto',
    color: '#C95824',
    fontSize: '13px',
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  stopMuted: {
    flex: '0 0 auto',
    color: '#6E685C',
    fontSize: '13px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  arrow: {
    flex: '0 0 auto',
    color: '#8B8578',
    fontSize: '13px',
    fontWeight: 800,
  },
}

export default MobileMapBlock

