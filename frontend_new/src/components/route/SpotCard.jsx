import React from 'react'
import { useAppStore } from '../../stores/appStore'

function SpotCard({ spot, isActive, onClick }) {
  const { openImageModal } = useAppStore()
  const imageUrl = spot.spotImageUrl || spot.spotImage

  return (
    <div
      style={{
        ...styles.card,
        ...(isActive ? styles.active : {})
      }}
      onClick={onClick}
    >
      {/* 当前讲解标签 */}
      {isActive && (
        <div style={styles.tag}>当前讲解</div>
      )}

      {/* 图片区 */}
      <div style={styles.imageWrap}>
        <img
          src={imageUrl}
          alt={spot.spotName}
          style={{
            ...styles.image,
            ...(isActive ? styles.imageActive : {})
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (imageUrl) {
              openImageModal(imageUrl)
            }
          }}
        />
      </div>

      <div style={styles.textWrap}>
        {/* 景点名称 */}
        <div style={{
          ...styles.name,
          ...(isActive ? styles.nameActive : {})
        }}>
          {spot.spotName}
        </div>

        {/* 景点描述 */}
        <div style={styles.desc}>
          {spot.spotDescription}
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    position: 'relative',
    height: '100%',
    minHeight: 0,
    padding: '8px',
    borderRadius: '10px',
    background: 'rgba(255, 251, 242, 0.9)',
    border: '1px solid rgba(221, 208, 183, 0.95)',
    overflow: 'hidden',
    boxShadow: '0 8px 18px rgba(104, 84, 57, 0.08)',
    transition: 'transform 240ms ease, border-color 240ms ease, box-shadow 240ms ease',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  active: {
    background: '#FFF8EE',
    border: '2px solid #D96A32',
    boxShadow: '0 12px 24px rgba(217, 106, 50, 0.14)'
  },
  tag: {
    position: 'absolute',
    left: '0',
    top: '0',
    height: '26px',
    padding: '0 10px',
    borderRadius: '0 0 8px 0',
    background: 'linear-gradient(90deg, #E97334 0%, #D85B26 100%)',
    color: '#FFF9F2',
    fontSize: '13px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    zIndex: 2,
    boxShadow: '0 6px 12px rgba(217, 106, 50, 0.22)'
  },
  imageWrap: {
    width: '58%',
    height: '100%',
    flex: '0 0 58%',
    borderRadius: '8px',
    overflow: 'hidden',
    background: '#E8DDCF',
    border: '1px solid rgba(255, 255, 255, 0.86)'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 240ms ease',
    cursor: 'pointer'
  },
  imageActive: {
    transform: 'scale(1.02)'
  },
  name: {
    fontSize: 'clamp(18px, 1.5vw, 22px)',
    lineHeight: 1.2,
    fontWeight: 700,
    color: '#3C352C',
    textAlign: 'left',
    fontFamily: '"Noto Serif SC", "Source Han Serif SC", "Songti SC", serif',
    marginTop: 0,
    flex: '0 0 auto',
    width: '100%'
  },
  nameActive: {
    color: '#C95824'
  },
  desc: {
    fontSize: 'clamp(12px, 0.95vw, 13px)',
    lineHeight: 1.42,
    color: '#5F574B',
    textAlign: 'left',
    marginTop: '8px',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    flex: '0 0 auto',
    width: '100%'
  },
  textWrap: {
    minWidth: 0,
    flex: 1
  }
}

export default SpotCard
