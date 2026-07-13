import React from 'react'
import { useAppStore } from '../../stores/appStore'

function ScrollPanel() {
  const { panelType, panelPayload, closePanel } = useAppStore()

  return (
    <div style={styles.container}>
      {/* 关闭按钮 */}
      <button
        style={styles.closeBtn}
        onClick={() => closePanel(true)}
      >
        ×
      </button>

      {panelType === 'knowledge' ? (
        <KnowledgePanel payload={panelPayload} />
      ) : panelType === 'map' ? (
        <MapPanel payload={panelPayload} />
      ) : null}
    </div>
  )
}

function KnowledgePanel({ payload }) {
  if (!payload) return null

  return (
    <div style={styles.panel}>
      {/* 标题区 */}
      <div style={styles.titleArea}>
        <h2 style={styles.title}>{payload.title || '知识卡片'}</h2>
      </div>

      {/* 视觉展示区 */}
      {payload.imageUrl && (
        <div style={styles.imageArea}>
          <img
            src={payload.imageUrl}
            alt={payload.title}
            style={styles.image}
          />
        </div>
      )}

      {/* 简短说明区 */}
      <div style={styles.descArea}>
        <p style={styles.desc}>{payload.description}</p>
      </div>

      {/* 关键词 */}
      {payload.keywords && (
        <div style={styles.keywords}>
          {payload.keywords.map((kw, i) => (
            <span key={i} style={styles.keyword}>#{kw}</span>
          ))}
        </div>
      )}
    </div>
  )
}

function MapPanel({ payload }) {
  if (!payload) return null

  return (
    <div style={styles.panel}>
      {/* 下一站标题 */}
      <div style={styles.mapHeader}>
        <span style={styles.nextLabel}>下一站</span>
        <span style={styles.nextName}>{payload.nextLocation}</span>
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
        <p>{payload.currentLocation}</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'absolute',
    right: '24px',
    top: '24px',
    width: '380px',
    maxHeight: 'calc(100vh - 48px)',
    background: 'rgba(249, 245, 234, 0.96)',
    borderRadius: '22px',
    border: '1.5px solid #D7A67B',
    boxShadow: '0 12px 28px rgba(131, 102, 68, 0.12)',
    overflow: 'hidden',
    zIndex: 30,
    animation: 'slideIn 500ms ease forwards'
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
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
    color: '#8B8578',
    zIndex: 10
  },
  panel: {
    padding: '24px'
  },
  titleArea: {
    marginBottom: '16px'
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#3C352C',
    fontFamily: '"Noto Serif SC", serif'
  },
  imageArea: {
    width: '100%',
    height: '200px',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '16px',
    background: '#F4F0E6'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  descArea: {
    marginBottom: '16px'
  },
  desc: {
    fontSize: '16px',
    color: '#6E685C',
    lineHeight: 1.6
  },
  keywords: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  keyword: {
    fontSize: '14px',
    color: '#D96A32',
    background: 'rgba(217, 106, 50, 0.1)',
    padding: '4px 12px',
    borderRadius: '12px'
  },
  mapHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
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
    fontSize: '16px',
    color: '#6E685C',
    lineHeight: 1.6
  }
}

export default ScrollPanel
