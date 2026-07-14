import React, { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { useRouteStore } from '../../stores/routeStore'
import { ROUTE_CARDS, SCENIC_SPOTS } from '../../data/scenicSpots'

function ScenicSidebar({ sendQuestion }) {
  const [collapsed, setCollapsed] = useState(false)
  const { mainState, openSpotDetail } = useAppStore()
  const { routePayload, reopenRouteMode } = useRouteStore()
  const isBusy = mainState === 'speaking' || mainState === 'thinking'

  const handleSpotClick = (spot) => {
    if (isBusy) return
    openSpotDetail(spot.id)
    sendQuestion(spot.question)
  }

  const handleRouteClick = (route) => {
    if (isBusy) return
    sendQuestion(route.question)
  }

  if (collapsed) {
    return (
      <button
        type="button"
        style={styles.expandButton}
        onClick={() => setCollapsed(false)}
        aria-label="展开景点列表"
        title="展开景点列表"
      >
        &gt;
      </button>
    )
  }

  return (
    <aside style={styles.sidebar} aria-label="景点预览列表">
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>景点知识讲解</div>
          <div style={styles.title}>灵山胜境</div>
        </div>
        <button
          type="button"
          style={styles.collapseButton}
          onClick={() => setCollapsed(true)}
          aria-label="收起景点列表"
          title="收起景点列表"
        >
          &lt;
        </button>
      </div>

      <div style={styles.scrollArea}>
        <section style={styles.section}>
          <div style={styles.sectionTitle}>景点预览</div>
          {SCENIC_SPOTS.map((spot, index) => (
            <button
              key={spot.id}
              type="button"
              style={{
                ...styles.spotCard,
                ...(isBusy ? styles.cardDisabled : {}),
                ...(index === 0 ? styles.firstSpotCard : {})
              }}
              onClick={() => handleSpotClick(spot)}
              disabled={isBusy}
              title={isBusy ? '数字人正在讲解中' : `查看${spot.title}`}
            >
              <img src={spot.imageUrl} alt={spot.title} style={styles.cardImage} />
              <div style={styles.cardBody}>
                {index === 0 && <div style={styles.currentLabel}>当前推荐</div>}
                <div style={styles.cardTitle}>{spot.title}</div>
                <div style={styles.cardText}>{spot.intro}</div>
                <div style={styles.cardMeta}>{spot.type} · {spot.stayDuration}</div>
              </div>
            </button>
          ))}
        </section>

        <section style={styles.section}>
          <div style={styles.sectionTitle}>路线推荐</div>
          {routePayload && (
            <button
              type="button"
              style={styles.recallCard}
              onClick={reopenRouteMode}
            >
              <span style={styles.recallTitle}>继续查看路线导览</span>
              <span style={styles.recallText}>返回上一条已生成路线</span>
            </button>
          )}
          {ROUTE_CARDS.map((route) => (
            <button
              key={route.id}
              type="button"
              style={{
                ...styles.routeCard,
                ...(isBusy ? styles.cardDisabled : {})
              }}
              onClick={() => handleRouteClick(route)}
              disabled={isBusy}
              title={isBusy ? '数字人正在讲解中' : route.title}
            >
              <span style={styles.routeTitle}>{route.title}</span>
              <span style={styles.routeText}>{route.description}</span>
            </button>
          ))}
        </section>
      </div>
    </aside>
  )
}

const styles = {
  sidebar: {
    position: 'absolute',
    left: '24px',
    top: '24px',
    bottom: '112px',
    width: '360px',
    zIndex: 24,
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(255, 251, 242, 0.94)',
    border: '1px solid rgba(215, 166, 123, 0.34)',
    borderRadius: '22px',
    boxShadow: '0 18px 42px rgba(116, 96, 68, 0.16)',
    backdropFilter: 'blur(14px)',
    overflow: 'hidden'
  },
  header: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 18px 14px',
    borderBottom: '1px solid rgba(215, 166, 123, 0.22)'
  },
  kicker: {
    color: '#7A9B79',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: 0
  },
  title: {
    marginTop: '4px',
    color: '#3C352C',
    fontSize: '24px',
    lineHeight: 1.15,
    fontWeight: 800,
    fontFamily: '"Noto Serif SC", "Songti SC", serif'
  },
  collapseButton: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '1px solid rgba(181, 143, 95, 0.42)',
    background: 'rgba(255, 251, 242, 0.9)',
    color: '#7A6A55',
    fontSize: '18px',
    fontWeight: 800,
    cursor: 'pointer',
    lineHeight: '30px'
  },
  expandButton: {
    position: 'absolute',
    left: '22px',
    top: '32px',
    zIndex: 24,
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    border: '1px solid rgba(181, 143, 95, 0.45)',
    background: 'rgba(255, 251, 242, 0.92)',
    color: '#7A6A55',
    fontSize: '20px',
    fontWeight: 800,
    boxShadow: '0 12px 28px rgba(116, 96, 68, 0.16)',
    cursor: 'pointer'
  },
  scrollArea: {
    minHeight: 0,
    overflowY: 'auto',
    padding: '16px 16px 18px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '18px'
  },
  sectionTitle: {
    color: '#6C8B6E',
    fontSize: '15px',
    fontWeight: 800
  },
  spotCard: {
    position: 'relative',
    width: '100%',
    minHeight: '112px',
    display: 'grid',
    gridTemplateColumns: '132px 1fr',
    gap: '12px',
    padding: '10px',
    textAlign: 'left',
    borderRadius: '16px',
    border: '1px solid rgba(215, 199, 168, 0.72)',
    background: 'rgba(255, 253, 247, 0.88)',
    color: '#3C352C',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(112, 91, 61, 0.08)',
    transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease'
  },
  firstSpotCard: {
    borderColor: 'rgba(217, 106, 50, 0.75)'
  },
  cardImage: {
    width: '132px',
    height: '92px',
    borderRadius: '12px',
    objectFit: 'cover',
    background: '#E9E1D0'
  },
  cardBody: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  currentLabel: {
    alignSelf: 'flex-start',
    marginBottom: '4px',
    padding: '3px 8px',
    borderRadius: '999px',
    background: '#D96A32',
    color: '#FFF9F2',
    fontSize: '11px',
    fontWeight: 800
  },
  cardTitle: {
    fontFamily: '"Noto Serif SC", "Songti SC", serif',
    fontSize: '21px',
    fontWeight: 900,
    lineHeight: 1.1,
    color: '#443A2E'
  },
  cardText: {
    marginTop: '6px',
    fontSize: '13px',
    lineHeight: 1.45,
    color: '#6E685C',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden'
  },
  cardMeta: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#8A7E6C',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  recallCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid rgba(122, 155, 121, 0.45)',
    background: 'rgba(236, 245, 225, 0.78)',
    color: '#567459',
    textAlign: 'left',
    cursor: 'pointer'
  },
  recallTitle: {
    fontSize: '15px',
    fontWeight: 800
  },
  recallText: {
    fontSize: '12px',
    color: '#708673'
  },
  routeCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid rgba(215, 199, 168, 0.72)',
    background: 'rgba(246, 249, 236, 0.84)',
    color: '#5E755D',
    textAlign: 'left',
    cursor: 'pointer'
  },
  routeTitle: {
    fontSize: '15px',
    fontWeight: 800
  },
  routeText: {
    fontSize: '12px',
    lineHeight: 1.45,
    color: '#7B8872'
  },
  cardDisabled: {
    opacity: 0.48,
    cursor: 'not-allowed'
  }
}

export default ScenicSidebar
