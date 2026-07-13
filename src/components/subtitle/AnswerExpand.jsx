import React from 'react'

function AnswerExpand({ content, onClose }) {
  if (!content) return null

  return (
    <div style={styles.container}>
      {/* 头部 */}
      <div style={styles.header}>
        <span style={styles.title}>完整回答</span>
        <button style={styles.closeBtn} onClick={onClose}>
          ×
        </button>
      </div>

      {/* 内容 */}
      <div style={styles.content}>
        {content}
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '400px',
    background: 'rgba(249, 245, 234, 0.96)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 8px 24px rgba(131, 102, 68, 0.15)',
    border: '1.5px solid #D7A67B',
    marginBottom: '12px',
    animation: 'slideUp 300ms ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#3C352C',
    fontFamily: '"Noto Serif SC", serif'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: '#8B8578',
    cursor: 'pointer',
    padding: '0 4px'
  },
  content: {
    fontSize: '14px',
    color: '#6E685C',
    lineHeight: 1.8,
    maxHeight: '200px',
    overflowY: 'auto'
  }
}

export default AnswerExpand
