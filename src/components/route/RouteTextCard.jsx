import React from 'react'

function RouteTextCard({ payload }) {
  const currentLocation = payload?.currentLocation || '灵山胜境入口'
  const nextLocation = payload?.nextLocation || '九龙灌浴'
  const estimatedDuration = payload?.estimatedDuration || '约 25 分钟'

  return (
    <div style={styles.card}>
      <div style={styles.innerBorder} />
      <div style={styles.cornerTopLeft} />
      <div style={styles.cornerTopRight} />
      <div style={styles.cornerBottomLeft} />
      <div style={styles.cornerBottomRight} />
      <div style={styles.mountainWash} />

      <div style={styles.header}>
        <svg width="52" height="24" viewBox="0 0 52 24" fill="none" aria-hidden="true">
          <path d="M3 14c6 0 7-7 12-7 4 0 4 5 1 6-2 1-4-1-3-3 1-4 8-6 12-2 3 3 2 8-2 10-5 3-10 0-13-3" stroke="#B88A55" strokeWidth="2" strokeLinecap="round" />
          <path d="M29 15c5 0 6-6 10-6 3 0 4 4 1 6-2 1-4-1-3-3 1-3 7-4 10 0 2 3 0 7-5 7" stroke="#B88A55" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div>
          <div style={styles.title}>路线导览</div>
          <div style={styles.subtitle}>当前推荐路线</div>
        </div>
      </div>

      <div style={styles.mainText}>
        您当前位于<span style={styles.emphasis}>{currentLocation}</span>，
        <br />
        推荐下一站前往<span style={styles.emphasis}>{nextLocation}</span>。
      </div>

      <div style={styles.divider}>
        <span style={styles.dividerDot} />
      </div>

      <div style={styles.supportText}>
        沿主游览轴线步行预计<span style={styles.highlight}>{estimatedDuration}</span>即可到达，
        并将继续经过沿途主要节点。
      </div>
    </div>
  )
}

const styles = {
  card: {
    width: '100%',
    height: 'clamp(320px, 39vh, 420px)',
    padding: '30px 34px 28px',
    borderRadius: '24px',
    background: [
      'radial-gradient(circle at 22% 12%, rgba(255, 255, 255, 0.72), transparent 34%)',
      'radial-gradient(circle at 85% 85%, rgba(225, 200, 154, 0.16), transparent 36%)',
      'linear-gradient(180deg, rgba(255, 252, 242, 0.98) 0%, rgba(249, 244, 230, 0.96) 100%)'
    ].join(', '),
    border: '1.5px solid rgba(206, 158, 101, 0.72)',
    boxShadow: '0 16px 34px rgba(104, 84, 57, 0.16), inset 0 0 0 1px rgba(255, 255, 255, 0.72)',
    position: 'relative',
    overflow: 'hidden'
  },
  innerBorder: {
    position: 'absolute',
    inset: '7px',
    borderRadius: '19px',
    border: '1px solid rgba(206, 158, 101, 0.34)',
    pointerEvents: 'none'
  },
  cornerTopLeft: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    width: '38px',
    height: '38px',
    borderTop: '2px solid rgba(185, 137, 82, 0.36)',
    borderLeft: '2px solid rgba(185, 137, 82, 0.36)',
    borderTopLeftRadius: '14px'
  },
  cornerTopRight: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    width: '38px',
    height: '38px',
    borderTop: '2px solid rgba(185, 137, 82, 0.36)',
    borderRight: '2px solid rgba(185, 137, 82, 0.36)',
    borderTopRightRadius: '14px'
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: '15px',
    left: '15px',
    width: '38px',
    height: '38px',
    borderBottom: '2px solid rgba(185, 137, 82, 0.28)',
    borderLeft: '2px solid rgba(185, 137, 82, 0.28)',
    borderBottomLeftRadius: '14px'
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    width: '38px',
    height: '38px',
    borderBottom: '2px solid rgba(185, 137, 82, 0.28)',
    borderRight: '2px solid rgba(185, 137, 82, 0.28)',
    borderBottomRightRadius: '14px'
  },
  mountainWash: {
    position: 'absolute',
    right: '20px',
    bottom: '14px',
    width: '210px',
    height: '72px',
    background: 'linear-gradient(135deg, transparent 16%, rgba(178, 159, 122, 0.12) 17% 33%, transparent 34%), linear-gradient(25deg, transparent 28%, rgba(178, 159, 122, 0.11) 29% 47%, transparent 48%)',
    opacity: 0.75,
    pointerEvents: 'none'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '24px',
    position: 'relative',
    zIndex: 1
  },
  title: {
    fontSize: '34px',
    lineHeight: 1,
    fontWeight: 700,
    color: '#30291F',
    letterSpacing: '0.04em',
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif'
  },
  subtitle: {
    marginTop: '6px',
    fontSize: '15px',
    color: '#6E9186',
    fontWeight: 600,
    letterSpacing: '0.05em'
  },
  mainText: {
    position: 'relative',
    zIndex: 1,
    fontSize: 'clamp(23px, 1.8vw, 28px)',
    lineHeight: 1.58,
    fontWeight: 600,
    color: '#3C352C',
    letterSpacing: '0'
  },
  emphasis: {
    color: '#C95824',
    fontWeight: 800,
    padding: '0 4px'
  },
  divider: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    height: '1px',
    margin: '22px 0 18px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(185, 137, 82, 0.36) 18%, rgba(185, 137, 82, 0.36) 82%, transparent 100%)'
  },
  dividerDot: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '9px',
    height: '9px',
    transform: 'translate(-50%, -50%) rotate(45deg)',
    border: '1px solid rgba(185, 137, 82, 0.52)',
    background: '#FFF8EA'
  },
  supportText: {
    position: 'relative',
    zIndex: 1,
    fontSize: '17px',
    lineHeight: 1.72,
    color: '#5F574B'
  },
  highlight: {
    color: '#C95824',
    fontWeight: 800,
    padding: '0 3px'
  }
}

export default RouteTextCard
