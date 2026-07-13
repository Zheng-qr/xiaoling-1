import React, { useRef, useMemo } from 'react'
import { useLive2D } from '../../hooks/useLive2D'
import { useAppStore } from '../../stores/appStore'

const MODEL_PATHS = {
  miara: '/models/miara_en/runtime/miara_pro_t03.model3.json',
  little_panda: '/models/little_panda/little_panda.model3.json',
  xuancao: '/models/xuancao/xuancao.model3.json',
}

function RouteAvatarStage() {
  const containerRef = useRef(null)
  const { currentModel } = useAppStore()
  const modelPath = useMemo(() => MODEL_PATHS[currentModel] || MODEL_PATHS.miara, [currentModel])
  const { isLoaded } = useLive2D(containerRef, modelPath)

  return (
    <div style={styles.container}>
      {/* Live2D数字人 */}
      <div style={styles.stage}>
        <div ref={containerRef} style={styles.canvas} />
      </div>

      {/* 脚底光晕 */}
      <div style={styles.glow} />
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    flex: 1,
    minHeight: 0,
    overflow: 'visible'
  },
  stage: {
    position: 'absolute',
    left: '49%',
    bottom: '-56px',
    width: 'min(112%, 470px)',
    height: 'min(126%, 610px)',
    transform: 'translateX(-50%)',
    zIndex: 1
  },
  canvas: {
    width: '100%',
    height: '100%',
    filter: 'drop-shadow(0 18px 28px rgba(81, 72, 58, 0.2))'
  },
  glow: {
    position: 'absolute',
    left: '50%',
    bottom: '2px',
    width: 'min(82%, 390px)',
    height: '100px',
    transform: 'translateX(-50%)',
    background: 'radial-gradient(ellipse, rgba(214, 151, 83, 0.18), transparent 58%), radial-gradient(ellipse, rgba(122, 155, 121, 0.1), transparent 74%)',
    filter: 'blur(14px)',
    pointerEvents: 'none'
  }
}

export default RouteAvatarStage
