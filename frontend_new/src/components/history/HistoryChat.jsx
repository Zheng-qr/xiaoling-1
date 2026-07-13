import React from 'react'
import { useMessageStore } from '../../stores/messageStore'

function HistoryChat() {
  const { messages } = useMessageStore()

  return (
    <div style={styles.container}>
      {messages.length === 0 ? (
        <div style={styles.empty}>暂无对话记录</div>
      ) : (
        messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage)
            }}
          >
            <div style={styles.role}>
              {msg.role === 'user' ? '游客' : '数字人'}
            </div>
            <div style={styles.content}>{msg.content}</div>
          </div>
        ))
      )}
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px'
  },
  empty: {
    textAlign: 'center',
    color: '#8B8578',
    fontSize: '16px',
    marginTop: '40px'
  },
  message: {
    marginBottom: '16px',
    padding: '12px 16px',
    borderRadius: '16px'
  },
  userMessage: {
    background: 'rgba(217, 106, 50, 0.1)',
    border: '1px solid rgba(217, 106, 50, 0.2)',
    marginLeft: '60px'
  },
  assistantMessage: {
    background: 'rgba(122, 155, 121, 0.1)',
    border: '1px solid rgba(122, 155, 121, 0.2)',
    marginRight: '60px'
  },
  role: {
    fontSize: '12px',
    color: '#8B8578',
    marginBottom: '4px'
  },
  content: {
    fontSize: '15px',
    color: '#3C352C',
    lineHeight: 1.6
  }
}

export default HistoryChat
