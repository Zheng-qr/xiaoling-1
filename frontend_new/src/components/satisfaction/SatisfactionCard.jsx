import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'

function SatisfactionCard({ sendSatisfaction }) {
  const { showSatisfaction, hideSatisfactionCard, pendingSatisfaction } = useAppStore()
  const [score, setScore] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  // 重置状态
  useEffect(() => {
    if (showSatisfaction) {
      setScore(0)
      setHoveredStar(0)
      setSubmitted(false)
    }
  }, [showSatisfaction])

  // 如果不显示，返回 null
  if (!showSatisfaction) return null

  // 提交评分
  const handleSubmit = () => {
    if (score > 0) {
      console.log('[满意度] 提交评分:', score, pendingSatisfaction)
      // 发送满意度到后端
      if (pendingSatisfaction) {
        sendSatisfaction(score, pendingSatisfaction.session_id, pendingSatisfaction.message_id)
      }
      setSubmitted(true)
      // 2秒后关闭
      setTimeout(() => {
        hideSatisfactionCard()
      }, 2000)
    }
  }

  // 关闭
  const handleClose = () => {
    hideSatisfactionCard()
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.backdrop} onClick={handleClose} />
      <div style={styles.card}>
        {/* 关闭按钮 */}
        <button style={styles.closeBtn} onClick={handleClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {submitted ? (
          // 提交成功
          <div style={styles.thanksContainer}>
            <div style={styles.thanksIcon}>✓</div>
            <div style={styles.thanksText}>感谢您的评价！</div>
          </div>
        ) : (
          // 评分界面
          <>
            <h3 style={styles.title}>请为本次导览评分</h3>

            <div style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  style={{
                    ...styles.star,
                    color: star <= (hoveredStar || score) ? '#D96A32' : '#D9C7A8'
                  }}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setScore(star)}
                >
                  ★
                </button>
              ))}
            </div>

            <div style={styles.scoreText}>
              {score > 0 ? `${score} 分` : '请点击星星评分'}
            </div>

            <button
              style={{
                ...styles.submitBtn,
                opacity: score > 0 ? 1 : 0.5
              }}
              onClick={handleSubmit}
              disabled={score === 0}
            >
              提交评价
            </button>
          </>
        )}
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
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 300ms ease'
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(60, 53, 44, 0.3)',
    backdropFilter: 'blur(4px)'
  },
  card: {
    position: 'relative',
    width: '320px',
    padding: '32px',
    background: 'rgba(249, 245, 234, 0.98)',
    borderRadius: '22px',
    border: '1.5px solid #D7A67B',
    boxShadow: '0 12px 28px rgba(131, 102, 68, 0.15)',
    textAlign: 'center'
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(255, 251, 242, 0.8)',
    border: '1px solid #D9C7A8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#8B8578'
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#3C352C',
    marginBottom: '24px',
    fontFamily: '"Noto Serif SC", serif'
  },
  stars: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  star: {
    fontSize: '36px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 200ms ease',
    padding: '0',
    lineHeight: 1
  },
  scoreText: {
    fontSize: '14px',
    color: '#8B8578',
    marginBottom: '24px'
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #D96A32, #C95824)',
    color: '#FFF9F2',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 200ms ease',
    fontFamily: '"HarmonyOS Sans SC", "Noto Sans SC", sans-serif'
  },
  thanksContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 0'
  },
  thanksIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7A9B79, #6E9186)',
    color: '#FFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 700
  },
  thanksText: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#3C352C'
  }
}

export default SatisfactionCard
