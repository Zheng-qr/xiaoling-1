import React, { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import Live2DViewer from './Live2DViewer'
import ThinkingVideo from './ThinkingVideo'

const MODELS = [
  { key: 'miara', label: 'Miara' },
  { key: 'little_panda', label: 'Little Panda' },
  { key: 'xuancao', label: 'Xuancao' },
]

function AvatarStage() {
  const { panelOpen, panelType, thinkingVideoVisible, mainState, currentModel, switchModel } = useAppStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const isSpeaking = mainState === 'speaking'

  // 计算舞台样式
  const getStageStyle = () => {
    let left = '50%'
    let scale = 1

    if (panelOpen) {
      if (panelType === 'map') {
        left = '28%'
        scale = 0.92
      } else if (panelType === 'knowledge') {
        left = '30%'
        scale = 0.93
      }
    }

    return {
      ...styles.stage,
      left,
      transform: `translate(-50%, -50%) scale(${scale})`
    }
  }

  return (
    <div className="avatar-stage" style={getStageStyle()} data-testid="avatar-stage">
      {/* 模型切换按钮 */}
      <div style={styles.modelSwitcher}>
        <button
          style={styles.modelBtn}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {MODELS.find(m => m.key === currentModel)?.label || 'Model'}
        </button>
        {menuOpen && (
          <div style={styles.modelMenu}>
            {MODELS.map(m => (
              <div
                key={m.key}
                style={{
                  ...styles.modelItem,
                  ...(m.key === currentModel ? styles.modelItemActive : {})
                }}
                onClick={() => {
                  switchModel(m.key)
                  setMenuOpen(false)
                }}
              >
                {m.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live2D渲染 */}
      <div style={styles.live2dContainer}>
        <Live2DViewer
          visible={!thinkingVideoVisible}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* 思考视频 */}
      <ThinkingVideo visible={thinkingVideoVisible} />

      {/* 脚底光晕 */}
      <div style={styles.glow} />
    </div>
  )
}

const styles = {
  modelSwitcher: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 20,
  },
  modelBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(215, 166, 123, 0.4)',
    background: 'rgba(255, 251, 242, 0.9)',
    backdropFilter: 'blur(8px)',
    color: '#6E685C',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'Noto Serif SC, serif',
  },
  modelMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '6px',
    borderRadius: '8px',
    border: '1px solid rgba(215, 166, 123, 0.3)',
    background: 'rgba(255, 251, 242, 0.95)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 16px rgba(131, 102, 68, 0.12)',
    overflow: 'hidden',
    minWidth: '130px',
  },
  modelItem: {
    padding: '8px 16px',
    fontSize: '13px',
    color: '#6E685C',
    cursor: 'pointer',
    fontFamily: 'Noto Serif SC, serif',
    transition: 'background 150ms ease',
  },
  modelItemActive: {
    background: 'rgba(122, 155, 121, 0.12)',
    color: '#5A7E59',
    fontWeight: 600,
  },
  stage: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: '40vw',
    height: '70vh',
    transform: 'translate(-50%, -50%) scale(1)',
    transition: 'left 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 10,
    overflow: 'visible'
  },
  live2dContainer: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  glow: {
    position: 'absolute',
    left: '50%',
    bottom: '12px',
    width: '340px',
    height: '90px',
    transform: 'translateX(-50%)',
    background: 'radial-gradient(circle, rgba(217, 106, 50, 0.14), transparent 52%), radial-gradient(circle, rgba(122, 155, 121, 0.08), transparent 70%)',
    filter: 'blur(12px)',
    pointerEvents: 'none'
  }
}

export default AvatarStage
