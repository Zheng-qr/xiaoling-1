import React, { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../stores/appStore'

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function InputBar({ sendQuestion }) {
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
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

  // 发送消息
  const handleSend = () => {
    if (inputValue.trim() && !isBusy) {
      if (isListening) {
        stopVoiceRecognition()
      }
      sendQuestion(inputValue.trim())
      setInputValue('')
    }
  }

  // 回车发送
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 根据状态计算透明度
  const getOpacity = () => {
    switch (mainState) {
      case 'speaking':
        return 1
      case 'idle':
        return 0.9
      case 'thinking':
        return 0.7
      default:
        return 0.9
    }
  }

  return (
    <div style={{ ...styles.container, opacity: getOpacity() }}>
      {/* 历史记录按钮 */}
      <button
        style={styles.historyButton}
        onClick={toggleHistory}
        title="查看历史记录"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </button>

      {/* 输入框 */}
      <div style={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          style={{
            ...styles.input,
            ...(isListening ? styles.inputListening : {})
          }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isListening ? '正在聆听...' : '请输入问题...'}
          disabled={isBusy}
        />
      </div>

      {/* 语音输入按钮 */}
      <button
        style={{
          ...styles.voiceButton,
          ...(isListening ? styles.voiceButtonActive : {}),
          ...(isBusy ? styles.voiceButtonDisabled : {})
        }}
        onClick={handleVoiceClick}
        disabled={isBusy}
        title={isListening ? '点击停止语音输入' : '语音输入'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>

      {/* 发送按钮 */}
      <button
        style={{
          ...styles.sendButton,
          ...(isBusy ? styles.sendButtonDisabled : {})
        }}
        onClick={handleSend}
        disabled={isBusy || !inputValue.trim()}
        title="发送"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  )
}

const styles = {
  container: {
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(249, 245, 234, 0.95)',
    borderRadius: '40px',
    boxShadow: '0 4px 16px rgba(131, 102, 68, 0.15)',
    border: '1px solid rgba(215, 166, 123, 0.3)',
    zIndex: 20,
    backdropFilter: 'blur(10px)',
    transition: 'opacity 300ms ease',
    minWidth: '500px'
  },
  historyButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 251, 242, 0.8)',
    border: '1px solid #D9C7A8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#6E685C',
    transition: 'all 200ms ease',
    flexShrink: 0
  },
  inputWrapper: {
    flex: 1,
    position: 'relative'
  },
  input: {
    width: '100%',
    height: '40px',
    padding: '0 16px',
    borderRadius: '20px',
    border: '1px solid #D9C7A8',
    background: 'rgba(255, 251, 242, 0.8)',
    fontSize: '14px',
    color: '#3C352C',
    outline: 'none',
    fontFamily: '"HarmonyOS Sans SC", "Noto Sans SC", sans-serif',
    transition: 'border-color 200ms ease'
  },
  inputListening: {
    borderColor: '#D96A32'
  },
  voiceButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 251, 242, 0.8)',
    border: '1px solid #D9C7A8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#6E685C',
    transition: 'all 200ms ease',
    flexShrink: 0
  },
  voiceButtonActive: {
    background: 'linear-gradient(135deg, #D96A32, #C95824)',
    borderColor: '#A9471F',
    color: '#FFF9F2',
    boxShadow: '0 4px 12px rgba(217, 106, 50, 0.35)'
  },
  voiceButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  sendButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D96A32, #C95824)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#FFF9F2',
    transition: 'all 200ms ease',
    flexShrink: 0
  },
  sendButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  }
}

export default InputBar
