import React from 'react'
import { useAppStore } from '../../stores/appStore'

function MobileKnowledgeBlock({ payload }) {
  const { openImageModal } = useAppStore()

  if (!payload) return null

  const imageUrl = payload.imageUrl || payload.image
  const title = payload.title || payload.name
  const description = payload.description || payload.details
  const keywords = Array.isArray(payload.keywords) ? payload.keywords : []

  if (!imageUrl && !title && !description && keywords.length === 0) return null

  return (
    <section style={styles.card}>
      {imageUrl && (
        <button
          type="button"
          style={styles.imageButton}
          onClick={() => openImageModal(imageUrl)}
          aria-label="查看知识图片"
        >
          <img src={imageUrl} alt={title || '知识图片'} style={styles.image} />
        </button>
      )}

      {title && <h2 style={styles.title}>{title}</h2>}
      {description && <p style={styles.description}>{description}</p>}

      {keywords.length > 0 && (
        <div style={styles.keywords}>
          {keywords.map((keyword) => (
            <span key={keyword} style={styles.keyword}>#{keyword}</span>
          ))}
        </div>
      )}
    </section>
  )
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
  imageButton: {
    display: 'block',
    width: '100%',
    height: 'min(42vw, 190px)',
    minHeight: '138px',
    padding: 0,
    overflow: 'hidden',
    borderRadius: '12px',
    background: '#F4F0E6',
  },
  image: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
  },
  title: {
    margin: '12px 2px 0',
    color: '#3C352C',
    fontSize: '18px',
    lineHeight: 1.35,
    fontWeight: 800,
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", serif',
  },
  description: {
    margin: '8px 2px 0',
    color: '#5F574B',
    fontSize: '14px',
    lineHeight: 1.72,
    wordBreak: 'break-word',
  },
  keywords: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '7px',
    marginTop: '10px',
  },
  keyword: {
    minHeight: '24px',
    padding: '3px 9px',
    borderRadius: '999px',
    background: 'rgba(217, 106, 50, 0.1)',
    color: '#A9471F',
    fontSize: '12px',
    fontWeight: 700,
  },
}

export default MobileKnowledgeBlock

