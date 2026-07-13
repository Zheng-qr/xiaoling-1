import React from 'react'
import MapHeader from './MapHeader'
import RouteInfoChips from './RouteInfoChips'
import MapViewport from './MapViewport'
import RouteSummaryStrip from './RouteSummaryStrip'

function RouteMapPanel({ payload, onBack }) {
  return (
    <div style={styles.panel}>
      <MapHeader title={payload?.routeTitle} />
      <RouteInfoChips payload={payload} />
      <MapViewport payload={payload} />
      <RouteSummaryStrip payload={payload} />
      <button style={styles.backBtn} onClick={onBack} aria-label="返回对话">
        返回对话
      </button>
    </div>
  )
}

const styles = {
  panel: {
    width: '100%',
    height: '100%',
    flex: '1 1 auto',
    minHeight: 0,
    padding: 'clamp(22px, 2.3vw, 34px) clamp(20px, 2.1vw, 30px) clamp(18px, 2vw, 26px)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    borderRadius: '24px',
    background: [
      'radial-gradient(circle at 16% 5%, rgba(255, 255, 255, 0.76), transparent 28%)',
      'linear-gradient(180deg, rgba(255, 252, 242, 0.97) 0%, rgba(249, 244, 230, 0.95) 100%)'
    ].join(', '),
    border: '1.5px solid rgba(181, 143, 95, 0.74)',
    boxShadow: '0 18px 38px rgba(104, 84, 57, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.72)'
  },
  backBtn: {
    position: 'absolute',
    right: '18px',
    top: '18px',
    height: '34px',
    padding: '0 14px',
    borderRadius: '999px',
    border: '1px solid rgba(181, 143, 95, 0.46)',
    background: 'rgba(255, 251, 242, 0.62)',
    color: '#7A6754',
    fontSize: '13px',
    fontWeight: 600,
    boxShadow: '0 8px 16px rgba(104, 84, 57, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(8px)',
    cursor: 'pointer'
  }
}

export default RouteMapPanel
