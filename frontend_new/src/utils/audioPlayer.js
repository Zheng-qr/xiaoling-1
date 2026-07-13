// 音频播放器类
export class AudioPlayer {
  constructor() {
    this.audioContext = null
    this.sourceNode = null
    this.gainNode = null
    this.analyserNode = null
    this.isPlaying = false
    this.onPlaybackEnd = null
    this.onLipSync = null
  }

  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.gainNode = this.audioContext.createGain()
      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = 256

      this.gainNode.connect(this.analyserNode)
      this.analyserNode.connect(this.audioContext.destination)
    } catch (error) {
      console.error('初始化音频播放器失败:', error)
    }
  }

  async playPCM16(pcmData, sampleRate = 24000, channels = 1) {
    if (!this.audioContext) {
      await this.init()
    }

    try {
      // 确保AudioContext处于运行状态
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      // 将PCM16数据转换为Float32
      const float32Data = this.pcm16ToFloat32(pcmData)

      // 创建AudioBuffer
      const audioBuffer = this.audioContext.createBuffer(
        channels,
        float32Data.length / channels,
        sampleRate
      )

      // 填充音频数据
      for (let channel = 0; channel < channels; channel++) {
        const channelData = audioBuffer.getChannelData(channel)
        for (let i = 0; i < channelData.length; i++) {
          channelData[i] = float32Data[i * channels + channel]
        }
      }

      // 创建音频源
      this.sourceNode = this.audioContext.createBufferSource()
      this.sourceNode.buffer = audioBuffer
      this.sourceNode.connect(this.gainNode)

      // 播放结束回调
      this.sourceNode.onended = () => {
        this.isPlaying = false
        if (this.onPlaybackEnd) {
          this.onPlaybackEnd()
        }
      }

      // 开始播放
      this.sourceNode.start()
      this.isPlaying = true

      // 开始LipSync
      this.startLipSync()

      return true
    } catch (error) {
      console.error('播放PCM16数据失败:', error)
      return false
    }
  }

  pcm16ToFloat32(pcm16) {
    const float32 = new Float32Array(pcm16.length / 2)
    for (let i = 0; i < float32.length; i++) {
      const low = pcm16[i * 2]
      const high = pcm16[i * 2 + 1]
      const sample = (high << 8) | low
      float32[i] = (sample > 32767 ? sample - 65536 : sample) / 32768.0
    }
    return float32
  }

  startLipSync() {
    if (!this.analyserNode || !this.onLipSync) return

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount)

    const update = () => {
      if (!this.isPlaying) return

      this.analyserNode.getByteFrequencyData(dataArray)

      // 计算音量（取低频段平均）
      const volume = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255

      if (this.onLipSync) {
        this.onLipSync(volume)
      }

      requestAnimationFrame(update)
    }

    update()
  }

  setVolume(volume) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume
    }
  }

  stop() {
    if (this.sourceNode) {
      this.sourceNode.stop()
      this.sourceNode = null
    }
    this.isPlaying = false
  }

  destroy() {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}
