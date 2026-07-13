import React, { useRef, useMemo } from 'react'
import { useLive2D } from '../../hooks/useLive2D'
import { useAppStore } from '../../stores/appStore'

const MODEL_PATHS = {
  miara: '/models/miara_en/runtime/miara_pro_t03.model3.json',
  little_panda: '/models/little_panda/little_panda.model3.json',
  xuancao: '/models/xuancao/xuancao.model3.json',
}

function Live2DViewer({ visible = true }) {
  const containerRef = useRef(null)
  const { currentModel } = useAppStore()

  const modelPath = useMemo(() => MODEL_PATHS[currentModel] || MODEL_PATHS.miara, [currentModel])

  const { isLoaded, error } = useLive2D(containerRef, modelPath)

  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8B8578',
        fontSize: '14px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{ 
          marginBottom: '12px',
          fontSize: '16px',
          color: '#6E685C'
        }}>
          数字人加载失败
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#A9471F',
          background: 'rgba(169, 71, 31, 0.1)',
          padding: '8px 16px',
          borderRadius: '8px',
          maxWidth: '300px',
          wordBreak: 'break-all'
        }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        opacity: visible ? 1 : 0,
        transition: 'opacity 300ms ease',
        pointerEvents: 'none'
      }}
      data-testid="live2d-container"
    />
  )
}

export default Live2DViewer
