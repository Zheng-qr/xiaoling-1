import React, { useEffect } from 'react'

function ImageModal({ imageUrl, onClose }) {
  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!imageUrl) return null

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container}>
        {/* 关闭按钮 */}
        <button style={styles.closeBtn} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* 图片 */}
        <img
          src={imageUrl}
          alt="放大查看"
          style={styles.image}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    cursor: 'pointer',
    animation: 'fadeIn 200ms ease'
  },
  container: {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
    cursor: 'default'
  },
  closeBtn: {
    position: 'absolute',
    top: '-48px',
    right: '0',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#FFF',
    transition: 'background 200ms ease'
  },
  image: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
  }
}

export default ImageModal
