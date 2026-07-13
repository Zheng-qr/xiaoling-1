import React, { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import Live2DViewer from '../avatar/Live2DViewer'
import ThinkingVideo from '../avatar/ThinkingVideo'

const MODELS = [
  { key: 'miara', label: 'Miara' },
  { key: 'little_panda', label: 'Little Panda' },
  { key: 'xuancao', label: 'Xuancao' },
]

function MobileAvatarStage() {
  const { currentModel, switchModel, thinkingVideoVisible } = useAppStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const activeModel = MODELS.find((model) => model.key === currentModel) || MODELS[0]

  return (
    <section style={styles.container} aria-label="数字人">
      <div style={styles.modelSwitcher}>
        <button
          type="button"
          style={styles.modelButton}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {activeModel.label}
        </button>
        {menuOpen && (
          <div style={styles.modelMenu}>
            {MODELS.map((model) => (
              <button
                key={model.key}
                type="button"
                style={{
                  ...styles.modelItem,
                  ...(model.key === currentModel ? styles.modelItemActive : {}),
                }}
                onClick={() => {
                  switchModel(model.key)
                  setMenuOpen(false)
                }}
              >
                {model.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={styles.live2dFrame}>
        <Live2DViewer visible={!thinkingVideoVisible} />
        <ThinkingVideo visible={thinkingVideoVisible} />
      </div>
      <div style={styles.glow} />
    </section>
  )
}

const styles = {
  container: {
    position: 'relative',
    flex: '0 0 46dvh',
    minHeight: '280px',
    maxHeight: '48dvh',
    width: '100%',
    overflow: 'visible',
    zIndex: 2,
  },
  modelSwitcher: {
    position: 'absolute',
    top: 'max(12px, env(safe-area-inset-top))',
    right: '14px',
    zIndex: 8,
  },
  modelButton: {
    minHeight: '34px',
    padding: '0 12px',
    borderRadius: '999px',
    border: '1px solid rgba(215, 166, 123, 0.44)',
    background: 'rgba(255, 251, 242, 0.88)',
    color: '#6E685C',
    fontSize: '12px',
    fontWeight: 700,
    boxShadow: '0 8px 16px rgba(131, 102, 68, 0.08)',
    backdropFilter: 'blur(10px)',
  },
  modelMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '138px',
    overflow: 'hidden',
    borderRadius: '10px',
    border: '1px solid rgba(215, 166, 123, 0.34)',
    background: 'rgba(255, 251, 242, 0.96)',
    boxShadow: '0 12px 24px rgba(131, 102, 68, 0.12)',
    backdropFilter: 'blur(10px)',
  },
  modelItem: {
    width: '100%',
    padding: '10px 12px',
    color: '#6E685C',
    fontSize: '13px',
    textAlign: 'left',
    borderBottom: '1px solid rgba(215, 166, 123, 0.18)',
  },
  modelItemActive: {
    color: '#5A7E59',
    background: 'rgba(122, 155, 121, 0.12)',
    fontWeight: 800,
  },
  live2dFrame: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 'min(96vw, 420px)',
    height: '100%',
    transform: 'translate(-50%, -50%)',
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
    left: '50%',
    bottom: '8px',
    width: 'min(74vw, 300px)',
    height: '70px',
    transform: 'translateX(-50%)',
    background: 'radial-gradient(ellipse, rgba(217, 106, 50, 0.16), transparent 58%), radial-gradient(ellipse, rgba(122, 155, 121, 0.1), transparent 74%)',
    filter: 'blur(14px)',
    pointerEvents: 'none',
  },
}

export default MobileAvatarStage
