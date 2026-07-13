// WebSocket客户端类
export class WebSocketClient {
  constructor(url, options = {}) {
    this.url = url
    this.options = {
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      heartbeatInterval: 35000,
      ...options
    }
    this.ws = null
    this.reconnectCount = 0
    this.heartbeatTimer = null
    this.onMessage = null
    this.onOpen = null
    this.onClose = null
    this.onError = null
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('WebSocket连接成功')
        this.reconnectCount = 0
        this.startHeartbeat()
        if (this.onOpen) this.onOpen()
      }

      this.ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          // 二进制数据（PCM16音频），转换为 ArrayBuffer
          const arrayBuffer = await event.data.arrayBuffer()
          if (this.onMessage) {
            this.onMessage({ type: 'binary', data: arrayBuffer })
          }
        } else {
          // JSON文本数据
          try {
            const data = JSON.parse(event.data)
            if (this.onMessage) this.onMessage(data)
          } catch (e) {
            console.error('解析WebSocket消息失败:', e)
          }
        }
      }

      this.ws.onclose = () => {
        console.log('WebSocket连接关闭')
        this.stopHeartbeat()
        if (this.onClose) this.onClose()
        this.tryReconnect()
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error)
        if (this.onError) this.onError(error)
      }
    } catch (error) {
      console.error('创建WebSocket连接失败:', error)
      this.tryReconnect()
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket未连接，无法发送消息')
    }
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping' })
    }, this.options.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  tryReconnect() {
    if (this.reconnectCount < this.options.reconnectAttempts) {
      this.reconnectCount++
      console.log(`尝试重连 (${this.reconnectCount}/${this.options.reconnectAttempts})...`)
      setTimeout(() => this.connect(), this.options.reconnectInterval)
    } else {
      console.error('WebSocket重连失败，已达到最大重试次数')
    }
  }

  disconnect() {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
