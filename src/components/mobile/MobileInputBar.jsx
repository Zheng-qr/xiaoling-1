import React, { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { useWebSocket } from '../../hooks/useWebSocket'

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function MobileInputBar() {
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const latestTranscriptRef = useRef('')
  const { sendQuestion } = useWebSocket()
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
    const text = inputValue.trim()
    if (text && !isBusy) {
      if (isListening) {
        stopVoiceRecognition()
      }
      sendQuestion(text)
      setInputValue('')
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.safeArea}>
      <div style={styles.container}>
        <button
          type="button"
          style={styles.iconButton}
          onClick={toggleHistory}
          aria-label="查看历史"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>

        <input
          ref={inputRef}
          type="text"
          style={{
            ...styles.input,
            ...(isListening ? styles.inputListening : {}),
          }}
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? '正在聆听...' : '请输入问题...'}
          disabled={isBusy}
        />

        <button
          type="button"
          style={{
            ...styles.iconButton,
            ...(isListening ? styles.voiceActive : {}),
            ...(isBusy ? styles.disabled : {}),
          }}
          onClick={handleVoiceClick}
          disabled={isBusy}
          aria-label={isListening ? '停止语音输入' : '语音输入'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

        <button
          type="button"
          style={{
            ...styles.sendButton,
            ...((isBusy || !inputValue.trim()) ? styles.disabled : {}),
          }}
          onClick={handleSend}
          disabled={isBusy || !inputValue.trim()}
          aria-label="发送"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

const styles = {
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    padding: '10px 12px calc(10px + env(safe-area-inset-bottom))',
    background: 'linear-gradient(180deg, rgba(221, 235, 212, 0), rgba(221, 235, 212, 0.92) 32%, rgba(221, 235, 212, 0.98) 100%)',
  },
  container: {
    width: '100%',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    borderRadius: '999px',
    background: 'rgba(249, 245, 234, 0.96)',
    border: '1px solid rgba(215, 166, 123, 0.34)',
    boxShadow: '0 10px 24px rgba(131, 102, 68, 0.16)',
    backdropFilter: 'blur(12px)',
  },
  iconButton: {
    flex: '0 0 40px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid #D9C7A8',
    background: 'rgba(255, 251, 242, 0.82)',
    color: '#6E685C',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: '1 1 auto',
    minWidth: 0,
    height: '40px',
    padding: '0 12px',
    borderRadius: '999px',
    border: '1px solid #D9C7A8',
    background: 'rgba(255, 251, 242, 0.86)',
    color: '#3C352C',
    fontSize: '14px',
    outline: 'none',
    fontFamily: '"HarmonyOS Sans SC", "Noto Sans SC", sans-serif',
  },
  inputListening: {
    borderColor: '#D96A32',
    boxShadow: '0 0 0 2px rgba(217, 106, 50, 0.12)',
  },
  voiceActive: {
    background: 'linear-gradient(135deg, #D96A32, #C95824)',
    borderColor: '#A9471F',
    color: '#FFF9F2',
  },
  sendButton: {
    flex: '0 0 40px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D96A32, #C95824)',
    color: '#FFF9F2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.48,
    cursor: 'not-allowed',
  },
}

export default MobileInputBar
