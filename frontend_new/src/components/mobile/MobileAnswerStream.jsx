import React, { useEffect, useMemo, useRef } from 'react'
import { useAppStore } from '../../stores/appStore'
import { useMessageStore } from '../../stores/messageStore'
import MobileKnowledgeBlock from './MobileKnowledgeBlock'
import MobileMapBlock from './MobileMapBlock'

function MobileAnswerStream() {
  const scrollRef = useRef(null)
  const { currentSentence } = useMessageStore()
  const { mainState, mobileGuideCard } = useAppStore()
  const shouldShowGuideCard = mainState === 'idle' && Boolean(mobileGuideCard?.payload)

  const mapPayload = useMemo(() => {
    if (shouldShowGuideCard && mobileGuideCard.type === 'route') return mobileGuideCard.payload
    return null
  }, [mobileGuideCard, shouldShowGuideCard])

  const knowledgePayload = useMemo(() => {
    if (shouldShowGuideCard && mobileGuideCard.type === 'spot') return mobileGuideCard.payload
    return null
  }, [mobileGuideCard, shouldShowGuideCard])

  useEffect(() => {
    if (!shouldShowGuideCard) return

    window.requestAnimationFrame(() => {
      const node = scrollRef.current
      if (!node) return
      node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
    })
  }, [shouldShowGuideCard, mapPayload, knowledgePayload])

  const hasText = Boolean(currentSentence)
  const statusText = getStatusText(mainState)

  return (
    <main style={styles.container}>
      <div ref={scrollRef} style={styles.scrollContent}>
        <section style={styles.textPanel}>
          <div style={styles.statusPill}>{statusText}</div>

          {currentSentence ? (
            <p style={styles.current}>{currentSentence}</p>
          ) : mainState === 'idle' && !shouldShowGuideCard ? (
            <p style={styles.empty}>
              可以向我提问景点知识，也可以让我推荐游览路线。
            </p>
          ) : null}

          {!hasText && mainState === 'thinking' && (
            <p style={styles.answer}>正在整理讲解内容，请稍等一下。</p>
          )}
        </section>

        <MobileKnowledgeBlock payload={knowledgePayload} />
        <MobileMapBlock payload={mapPayload} />
      </div>
    </main>
  )
}

function getStatusText(state) {
  switch (state) {
    case 'listening':
      return '正在聆听'
    case 'thinking':
      return '正在思考'
    case 'speaking':
      return '正在讲解'
    default:
      return '随时提问'
  }
}

const styles = {
  container: {
    flex: '1 1 auto',
    minHeight: 0,
    width: '100%',
    padding: '0 14px 100px',
    overflow: 'hidden',
    zIndex: 3,
  },
  scrollContent: {
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    WebkitOverflowScrolling: 'touch',
    padding: '4px 0 18px',
  },
  textPanel: {
    width: '100%',
    padding: '14px 15px 16px',
    borderRadius: '16px',
    background: 'rgba(255, 251, 242, 0.84)',
    border: '1px solid rgba(215, 166, 123, 0.28)',
    boxShadow: '0 12px 24px rgba(131, 102, 68, 0.1)',
    backdropFilter: 'blur(12px)',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '24px',
    padding: '0 10px',
    marginBottom: '10px',
    borderRadius: '999px',
    background: 'rgba(122, 155, 121, 0.12)',
    color: '#5A7E59',
    fontSize: '12px',
    fontWeight: 800,
  },
  current: {
    margin: 0,
    color: '#3C352C',
    fontSize: '18px',
    lineHeight: 1.62,
    fontWeight: 800,
    wordBreak: 'break-word',
  },
  empty: {
    margin: 0,
    color: '#6E685C',
    fontSize: '16px',
    lineHeight: 1.6,
    wordBreak: 'break-word',
  },
  answer: {
    margin: '10px 0 0',
    color: '#5F574B',
    fontSize: '14px',
    lineHeight: 1.72,
    wordBreak: 'break-word',
    whiteSpace: 'pre-wrap',
  },
}

export default MobileAnswerStream
