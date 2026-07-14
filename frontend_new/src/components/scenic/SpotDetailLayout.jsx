import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { useMessageStore } from '../../stores/messageStore'
import { useLive2D } from '../../hooks/useLive2D'
import { getScenicSpotById } from '../../data/scenicSpots'
import HistoryOverlay from '../history/HistoryOverlay'
import SatisfactionCard from '../satisfaction/SatisfactionCard'
import ImageModal from '../common/ImageModal'

const MODEL_PATHS = {
  miara: '/models/miara_en/runtime/miara_pro_t03.model3.json',
  little_panda: '/models/little_panda/little_panda.model3.json',
  xuancao: '/models/xuancao/xuancao.model3.json',
}

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function SpotDetailAvatar() {
  const containerRef = useRef(null)
  const { currentModel } = useAppStore()
  const modelPath = useMemo(() => MODEL_PATHS[currentModel] || MODEL_PATHS.miara, [currentModel])
  useLive2D(containerRef, modelPath)

  return (
    <div style={styles.avatarWrap}>
      <div ref={containerRef} style={styles.avatarCanvas} />
      <div style={styles.avatarGlow} />
    </div>
  )
}

function SpotDetailInputBar({ spot, sendQuestion }) {
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const latestTranscriptRef = useRef('')
  const { toggleHistory, mainState, transitionTo } = useAppStore()
  const isBusy = mainState === 'speaking' || mainState === 'thinking'

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null
        recognitionRef.current.onresult = null
        recognitionRef.current.onerror = null
        recognitionRef.current.onend = null
        try {
          recognitionRef.current.abort()
        } catch (err) {}
      }
    }
  }, [])

  useEffect(() => {
    setFavorited(false)
    setInputValue('')
  }, [spot?.id])

  const restoreIdleAfterListening = () => {
    setIsListening(false)
    if (useAppStore.getState().mainState === 'listening') {
      transitionTo('idle')
    }
  }

  const updateRecognizedText = (text) => {
    latestTranscriptRef.current = text
    setInputValue(text)
    if (inputRef.current) {
      inputRef.current.value = text
    }
  }

  const readTranscript = (event) => {
    let finalText = ''
    let interimText = ''

    for (let index = 0; index < event.results.length; index += 1) {
      const result = event.results[index]
      const transcript = result?.[0]?.transcript || ''
      if (result?.isFinal) {
        finalText += transcript
      } else {
        interimText += transcript
      }
    }

    return `${finalText}${interimText}`.trim()
  }

  const createRecognition = () => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      latestTranscriptRef.current = inputRef.current?.value?.trim() || ''
      transitionTo('listening')
    }

    recognition.onresult = (event) => {
      const text = readTranscript(event)
      if (text) {
        updateRecognizedText(text)
      }
    }

    recognition.onerror = (event) => {
      console.warn('[SpeechRecognition] error:', event.error)
      restoreIdleAfterListening()
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        window.alert('无法使用麦克风权限，请允许浏览器访问麦克风后再试')
      }
    }

    recognition.onend = () => {
      if (latestTranscriptRef.current) {
        updateRecognizedText(latestTranscriptRef.current)
      }
      restoreIdleAfterListening()
    }

    return recognition
  }

  const stopVoiceRecognition = () => {
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.stop()
    } catch (err) {
      restoreIdleAfterListening()
    }
  }

  const handleVoiceClick = () => {
    if (isBusy) return

    if (!getSpeechRecognition()) {
      window.alert('当前浏览器不支持语音输入，请使用 Chrome 或 Edge')
      return
    }

    if (isListening) {
      stopVoiceRecognition()
      return
    }

    const recognition = recognitionRef.current || createRecognition()
    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (err) {
      console.warn('[SpeechRecognition] start failed:', err)
    }
  }

  const handleSend = () => {
    if (!inputValue.trim() || isBusy) return
    if (isListening) {
      stopVoiceRecognition()
    }
    sendQuestion(inputValue.trim())
    setInputValue('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.detailInputDock}>
      <button
        type="button"
        style={styles.roundToolButton}
        onClick={toggleHistory}
        title="查看历史记录"
        aria-label="查看历史记录"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>

      <div style={styles.detailInputShell}>
        <input
          ref={inputRef}
          type="text"
          style={{
            ...styles.detailInput,
            ...(isListening ? styles.detailInputListening : {})
          }}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? '正在聆听...' : '想了解更多？请输入问题...'}
          disabled={isBusy}
        />
      </div>

      <button
        type="button"
        style={{
          ...styles.roundToolButton,
          ...(isListening ? styles.voiceActiveButton : {}),
          ...(isBusy ? styles.disabledButton : {})
        }}
        onClick={handleVoiceClick}
        disabled={isBusy}
        title={isListening ? '点击停止语音输入' : '语音输入'}
        aria-label="语音输入"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>

      <button
        type="button"
        style={{
          ...styles.sendDetailButton,
          ...(isBusy || !inputValue.trim() ? styles.disabledButton : {})
        }}
        onClick={handleSend}
        disabled={isBusy || !inputValue.trim()}
        title="发送"
        aria-label="发送"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        <span style={styles.sendText}>发送</span>
      </button>

      <button
        type="button"
        style={{
          ...styles.favoriteButton,
          ...(favorited ? styles.favoriteButtonActive : {})
        }}
        onClick={() => setFavorited((value) => !value)}
        title={favorited ? '取消收藏景点' : '收藏景点'}
        aria-label={favorited ? '取消收藏景点' : '收藏景点'}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span style={styles.favoriteText}>{favorited ? '已收藏' : '收藏景点'}</span>
      </button>
    </div>
  )
}

function SpotDetailLayout({ sendQuestion, sendSatisfaction }) {
  const {
    selectedSpotId,
    closeSpotDetail,
    historyOpen,
    imageModal,
    closeImageModal,
    openImageModal
  } = useAppStore()
  const currentSentence = useMessageStore((state) => state.currentSentence)
  const spot = getScenicSpotById(selectedSpotId)

  if (!spot) {
    return (
      <div className="main-mode-bg" style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyTitle}>未找到景点资料</div>
          <button type="button" style={styles.backButton} onClick={closeSpotDetail}>
            返回景点列表
          </button>
        </div>
      </div>
    )
  }

  const bubbleText = currentSentence || `欢迎来到${spot.title}。${spot.intro}`

  return (
    <div className="spot-detail-layout main-mode-bg" style={styles.container}>
      <div style={styles.leftPane}>
        <div style={styles.leftBadge}>景点知识讲解</div>
        <div style={styles.leftTitle}>{spot.title}</div>
        <div style={styles.leftSubtitle}>无锡灵山胜境核心景点</div>
        <div style={styles.speechBubble}>{bubbleText}</div>
        <SpotDetailAvatar />
      </div>

      <main style={styles.detailPanel}>
        <div style={styles.panelHeader}>
          <button type="button" style={styles.backButton} onClick={closeSpotDetail}>
            <span style={styles.backArrow}>←</span>
            返回景点列表
          </button>
          <div style={styles.headerText}>
            <div style={styles.panelTitle}>{spot.title}</div>
            <div style={styles.panelSubTitle}>景点知识卡</div>
          </div>
        </div>

        <div style={styles.detailGrid}>
          <button
            type="button"
            style={styles.imageButton}
            onClick={() => openImageModal(spot.imageUrl)}
            title="放大查看图片"
          >
            <img src={spot.imageUrl} alt={spot.title} style={styles.heroImage} />
          </button>

          <aside style={styles.infoPanel}>
            <div style={styles.infoTitle}>基础信息</div>
            <InfoRow label="景点类型" value={spot.type} />
            <InfoRow label="建议停留" value={spot.stayDuration} />
            <InfoRow label="推荐看点" value={spot.highlights} />
            <InfoRow label="适合人群" value={spot.audience} />
            <InfoRow label="开放时间" value={spot.openTime} />
            <InfoRow label="景点位置" value={spot.location} />
          </aside>
        </div>

        <section style={styles.knowledgeSection}>
          <div style={styles.sectionHeader}>知识讲解</div>
          <p style={styles.knowledgeText}>{spot.intro}</p>
        </section>

        <section style={styles.tagsSection}>
          <div style={styles.sectionHeader}>关键词</div>
          <div style={styles.tags}>
            {spot.tags.map((tag) => (
              <span key={tag} style={styles.tag}>{tag}</span>
            ))}
          </div>
        </section>
      </main>

      <SpotDetailInputBar spot={spot} sendQuestion={sendQuestion} />

      {historyOpen && <HistoryOverlay />}
      <SatisfactionCard sendSatisfaction={sendSatisfaction} />
      {imageModal.visible && (
        <ImageModal
          imageUrl={imageModal.imageUrl}
          onClose={closeImageModal}
        />
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoLabel}>{label}</div>
      <div style={styles.infoValue}>{value}</div>
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '32% 1fr',
    gap: '24px',
    padding: '26px 34px 108px',
    boxSizing: 'border-box'
  },
  leftPane: {
    position: 'relative',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '18px',
    overflow: 'visible'
  },
  leftBadge: {
    alignSelf: 'flex-start',
    padding: '10px 22px',
    borderRadius: '18px',
    border: '1px solid rgba(215, 166, 123, 0.42)',
    background: 'rgba(255, 251, 242, 0.92)',
    color: '#6E685C',
    fontFamily: '"Noto Serif SC", "Songti SC", serif',
    fontSize: '20px',
    fontWeight: 800,
    boxShadow: '0 10px 24px rgba(116, 96, 68, 0.12)'
  },
  leftTitle: {
    marginTop: '34px',
    width: '100%',
    color: '#465944',
    fontFamily: '"Noto Serif SC", "Songti SC", serif',
    fontSize: '42px',
    fontWeight: 900,
    lineHeight: 1.12,
    textAlign: 'center'
  },
  leftSubtitle: {
    marginTop: '12px',
    color: '#7A6A55',
    fontSize: '15px',
    fontWeight: 700,
    textAlign: 'center'
  },
  speechBubble: {
    alignSelf: 'center',
    width: 'min(86%, 420px)',
    maxHeight: '154px',
    marginTop: '24px',
    padding: '18px 20px',
    borderRadius: '22px',
    border: '1px solid rgba(215, 166, 123, 0.38)',
    background: 'rgba(255, 251, 242, 0.92)',
    color: '#4E463A',
    fontSize: '16px',
    lineHeight: 1.75,
    overflow: 'hidden',
    boxShadow: '0 12px 28px rgba(116, 96, 68, 0.11)'
  },
  avatarWrap: {
    position: 'relative',
    width: '100%',
    flex: 1,
    minHeight: '360px',
    marginTop: '10px',
    overflow: 'visible'
  },
  avatarCanvas: {
    position: 'absolute',
    left: '50%',
    bottom: '-70px',
    width: 'min(112%, 520px)',
    height: 'min(120%, 650px)',
    transform: 'translateX(-50%)',
    filter: 'drop-shadow(0 18px 30px rgba(81, 72, 58, 0.18))',
    zIndex: 2
  },
  avatarGlow: {
    position: 'absolute',
    left: '50%',
    bottom: '12px',
    width: 'min(76%, 380px)',
    height: '96px',
    transform: 'translateX(-50%)',
    background: 'radial-gradient(ellipse, rgba(214, 151, 83, 0.18), transparent 58%), radial-gradient(ellipse, rgba(122, 155, 121, 0.12), transparent 72%)',
    filter: 'blur(14px)',
    pointerEvents: 'none',
    zIndex: 1
  },
  detailPanel: {
    minWidth: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '24px',
    borderRadius: '26px',
    border: '1.5px solid rgba(215, 166, 123, 0.52)',
    background: 'rgba(255, 251, 242, 0.9)',
    boxShadow: '0 18px 44px rgba(116, 96, 68, 0.16)',
    backdropFilter: 'blur(14px)',
    boxSizing: 'border-box',
    overflow: 'hidden'
  },
  panelHeader: {
    position: 'relative',
    minHeight: '74px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerText: {
    textAlign: 'center'
  },
  panelTitle: {
    color: '#7A3F25',
    fontFamily: '"Noto Serif SC", "Songti SC", serif',
    fontSize: '42px',
    lineHeight: 1.06,
    fontWeight: 900
  },
  panelSubTitle: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '4px 28px',
    borderRadius: '999px',
    border: '1px solid rgba(215, 166, 123, 0.45)',
    color: '#9B744C',
    fontSize: '14px',
    fontWeight: 800,
    letterSpacing: 0
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: '40px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 16px',
    borderRadius: '999px',
    border: '1px solid rgba(181, 143, 95, 0.48)',
    background: 'rgba(246, 249, 236, 0.86)',
    color: '#6E725E',
    fontSize: '14px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 8px 18px rgba(116, 96, 68, 0.1)'
  },
  backArrow: {
    fontSize: '18px',
    lineHeight: 1
  },
  detailGrid: {
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(380px, 1fr) minmax(250px, 300px)',
    gap: '16px'
  },
  imageButton: {
    minWidth: 0,
    border: '1px solid rgba(215, 166, 123, 0.34)',
    borderRadius: '16px',
    padding: 0,
    overflow: 'hidden',
    background: '#E9E1D0',
    cursor: 'zoom-in',
    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.72)'
  },
  heroImage: {
    display: 'block',
    width: '100%',
    height: '100%',
    minHeight: '320px',
    maxHeight: '430px',
    objectFit: 'cover'
  },
  infoPanel: {
    minWidth: 0,
    padding: '18px',
    borderRadius: '16px',
    border: '1px solid rgba(215, 199, 168, 0.72)',
    background: 'rgba(255, 253, 247, 0.82)',
    overflowY: 'auto'
  },
  infoTitle: {
    marginBottom: '10px',
    color: '#7A6A55',
    fontSize: '18px',
    fontWeight: 900,
    fontFamily: '"Noto Serif SC", "Songti SC", serif'
  },
  infoRow: {
    padding: '12px 0',
    borderBottom: '1px dashed rgba(181, 143, 95, 0.28)'
  },
  infoLabel: {
    marginBottom: '5px',
    color: '#A17E55',
    fontSize: '13px',
    fontWeight: 800
  },
  infoValue: {
    color: '#4D4438',
    fontSize: '14px',
    lineHeight: 1.55
  },
  knowledgeSection: {
    flexShrink: 0,
    padding: '18px 20px',
    borderRadius: '16px',
    border: '1px solid rgba(215, 199, 168, 0.72)',
    background: 'rgba(255, 253, 247, 0.78)'
  },
  sectionHeader: {
    color: '#7A6A55',
    fontSize: '17px',
    fontWeight: 900,
    fontFamily: '"Noto Serif SC", "Songti SC", serif'
  },
  knowledgeText: {
    margin: '10px 0 0',
    color: '#4D4438',
    fontSize: '15px',
    lineHeight: 1.85
  },
  tagsSection: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    borderRadius: '16px',
    border: '1px solid rgba(215, 199, 168, 0.72)',
    background: 'rgba(255, 253, 247, 0.78)'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  tag: {
    padding: '6px 14px',
    borderRadius: '999px',
    border: '1px solid rgba(122, 155, 121, 0.32)',
    background: 'rgba(236, 245, 225, 0.72)',
    color: '#5E755D',
    fontSize: '13px',
    fontWeight: 700
  },
  detailInputDock: {
    position: 'absolute',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    zIndex: 30,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: 'min(1000px, calc(100% - 68px))',
    padding: '12px 16px',
    borderRadius: '999px',
    border: '1px solid rgba(215, 166, 123, 0.34)',
    background: 'rgba(255, 251, 242, 0.96)',
    boxShadow: '0 12px 32px rgba(116, 96, 68, 0.18)',
    backdropFilter: 'blur(12px)'
  },
  roundToolButton: {
    width: '44px',
    height: '44px',
    flexShrink: 0,
    borderRadius: '50%',
    border: '1px solid rgba(181, 143, 95, 0.45)',
    background: 'rgba(255, 253, 247, 0.92)',
    color: '#7A6A55',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  detailInputShell: {
    flex: 1,
    minWidth: 0
  },
  detailInput: {
    width: '100%',
    height: '44px',
    padding: '0 20px',
    boxSizing: 'border-box',
    borderRadius: '999px',
    border: '1px solid rgba(181, 143, 95, 0.35)',
    background: 'rgba(255, 253, 247, 0.95)',
    color: '#3C352C',
    fontSize: '15px',
    outline: 'none',
    fontFamily: '"HarmonyOS Sans SC", "Noto Sans SC", sans-serif'
  },
  detailInputListening: {
    borderColor: '#D96A32',
    boxShadow: '0 0 0 3px rgba(217, 106, 50, 0.12)'
  },
  voiceActiveButton: {
    background: '#D96A32',
    borderColor: '#C95824',
    color: '#FFF9F2'
  },
  sendDetailButton: {
    height: '48px',
    minWidth: '104px',
    flexShrink: 0,
    borderRadius: '999px',
    border: 'none',
    background: 'linear-gradient(135deg, #D96A32, #C95824)',
    color: '#FFF9F2',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 800,
    boxShadow: '0 10px 20px rgba(217, 106, 50, 0.22)'
  },
  sendText: {
    whiteSpace: 'nowrap'
  },
  favoriteButton: {
    height: '48px',
    minWidth: '130px',
    flexShrink: 0,
    borderRadius: '16px',
    border: '1px solid rgba(181, 143, 95, 0.42)',
    background: 'rgba(246, 249, 236, 0.9)',
    color: '#6E725E',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 800
  },
  favoriteButtonActive: {
    background: 'rgba(217, 106, 50, 0.13)',
    borderColor: 'rgba(217, 106, 50, 0.42)',
    color: '#B95425'
  },
  favoriteText: {
    whiteSpace: 'nowrap'
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  emptyState: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  emptyTitle: {
    marginBottom: '18px',
    color: '#3C352C',
    fontSize: '20px',
    fontWeight: 800
  }
}

export default SpotDetailLayout
