import React from 'react'

function KnowledgePanel({ payload, onClose }) {
  if (!payload) return null

  return (
    <div style={styles.container}>
      {/* 标题区 */}
      <div style={styles.header}>
        <h2 style={styles.title}>{payload.title || '知识卡片'}</h2>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
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
      {payload.keywords && payload.keywords.length > 0 && (
        <div style={styles.keywords}>
          {payload.keywords.map((kw, i) => (
            <span key={i} style={styles.keyword}>#{kw}</span>
          ))}
        </div>
      )}
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
    alignItems: 'center',
    marginBottom: '16px'
  },
  title: {
    fontSize: '28px',
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
  }
}

export default KnowledgePanel
