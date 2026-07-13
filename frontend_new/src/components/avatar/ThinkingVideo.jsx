import React from 'react'

function ThinkingVideo({ visible = false }) {
  if (!visible) return null

  return (
    <div style={styles.container}>
      {/* 思考动画 */}
      <div style={styles.animation}>
        <div style={styles.dot1} />
        <div style={styles.dot2} />
        <div style={styles.dot3} />
      </div>

      {/* 思考文字 */}
      <div style={styles.text}>思考中...</div>
    </div>
  )
}

const styles = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle, rgba(217, 106, 50, 0.08), transparent 70%)',
    animation: 'fadeIn 300ms ease'
  },
  animation: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px'
  },
  dot1: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#D96A32',
    animation: 'bounce 1.4s infinite ease-in-out both',
    animationDelay: '-0.32s'
  },
  dot2: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#D96A32',
    animation: 'bounce 1.4s infinite ease-in-out both',
    animationDelay: '-0.16s'
  },
  dot3: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#D96A32',
    animation: 'bounce 1.4s infinite ease-in-out both'
  },
  text: {
    fontSize: '18px',
    color: '#6E685C',
    fontFamily: '"Noto Serif SC", serif'
  }
}

export default ThinkingVideo
