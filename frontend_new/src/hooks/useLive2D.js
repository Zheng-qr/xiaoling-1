import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../stores/appStore'
import { useAudioStore } from '../stores/audioStore'

const MODEL_CONFIGS = {
  miara: { scale: 0.25, y: 0.61, mobileScale: 0.22, mobileY: 0.64 },
  little_panda: { scale: 0.05, y: 0.55, mobileScale: 0.047, mobileY: 0.57 },
  xuancao: { scale: 0.10, y: 0.59, mobileScale: 0.08, mobileY: 0.61 },
}

const LITTLE_PANDA_WATERMARK_PARAM_ID = 'Param'
const LITTLE_PANDA_WATERMARK_PART_ID = 'Part16'
const XUANCAO_WATERMARK_PARAM_IDS = []
const XUANCAO_WATERMARK_PART_IDS = []

function getModelKey(modelPath) {
  return Object.keys(MODEL_CONFIGS).find(key => modelPath?.includes(key)) || 'miara'
}

function hideLittlePandaWatermark(model) {
  const coreModel = model?.internalModel?.coreModel
  if (!coreModel) return

  try {
    coreModel.setParameterValueById(LITTLE_PANDA_WATERMARK_PARAM_ID, 0)
  } catch (err) {}

  try {
    coreModel.setPartOpacityById(LITTLE_PANDA_WATERMARK_PART_ID, 0)
  } catch (err) {}
}

function hideXuancaoWatermark(model) {
  const coreModel = model?.internalModel?.coreModel
  if (!coreModel) return

  XUANCAO_WATERMARK_PARAM_IDS.forEach(paramId => {
    try {
      coreModel.setParameterValueById(paramId, 0)
    } catch (err) {}
  })

  XUANCAO_WATERMARK_PART_IDS.forEach(partId => {
    try {
      coreModel.setPartOpacityById(partId, 0)
    } catch (err) {}
  })
}

function hideModelWatermark(model, modelKey) {
  if (modelKey === 'little_panda') {
    hideLittlePandaWatermark(model)
  } else if (modelKey === 'xuancao') {
    hideXuancaoWatermark(model)
  }
}

export function useLive2D(containerRef, modelPath) {
  const modelRef = useRef(null)
  const appRef = useRef(null)
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)
  const mainState = useAppStore(state => state.mainState)
  const analyserNode = useAudioStore(state => state.analyserNode)
  const lastIdleRetryRef = useRef(0)
  const modelKeyRef = useRef('miara')

  function hasMotionGroup(model, group) {
    const definitions = model?.internalModel?.motionManager?.definitions || {}
    return Boolean(definitions[group]?.length)
  }

  function playMotionSafely(model, groups, priority = 3) {
    if (!model) return null

    const group = groups.find(candidate => hasMotionGroup(model, candidate))
    if (!group) return null

    try {
      Promise.resolve(model.motion(group, undefined, priority)).catch(err => {
        console.warn('[useLive2D] motion failed:', group, err?.message || err)
      })
      return group
    } catch (err) {
      console.warn('[useLive2D] motion failed:', group, err?.message || err)
      return null
    }
  }

  function ensureIdleMotion(model) {
    if (!hasMotionGroup(model, 'Idle')) return

    const state = model?.internalModel?.motionManager?.state
    const now = performance.now()
    if (state?.currentGroup || state?.reservedIdleGroup || now - lastIdleRetryRef.current < 1200) {
      return
    }

    lastIdleRetryRef.current = now
    playMotionSafely(model, ['Idle'], 1)
  }

  useEffect(() => {
    let cancelled = false

    const initLive2D = async () => {
      try {
        if (!window.Live2DCubismCore) {
          console.log('[useLive2D] Live2DCubismCore not loaded, loading...')
          try {
            await new Promise((resolve, reject) => {
              const script = document.createElement('script')
              script.src = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'
              script.onload = () => { console.log('[useLive2D] Live2DCubismCore loaded'); resolve() }
              script.onerror = () => { reject(new Error('Live2DCubismCore load failed')) }
              document.head.appendChild(script)
            })
          } catch (err) {
            setError('Cubism Core load failed')
            return
          }
        }

        if (cancelled || !containerRef.current) return

        const PIXI = await import('pixi.js')
        const { Live2DModel } = await import('pixi-live2d-display/cubism4')

        if (cancelled || !containerRef.current) return

        const width = containerRef.current.clientWidth || 800
        const height = containerRef.current.clientHeight || 900

        // 关键修复：不传 view，让 PIXI 自己创建 canvas
        // 避免 WebGL 上下文复用冲突
        const app = new PIXI.Application({
          width,
          height,
          transparent: true,
          backgroundAlpha: 0,
          antialias: true,
          autoStart: true,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
        })

        appRef.current = app
        canvasRef.current = app.view

        // 清空容器并挂载新 canvas
        const container = containerRef.current
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
        container.appendChild(app.view)

        console.log('[useLive2D] Loading model:', modelPath)

        const model = await Live2DModel.from(modelPath, {
          autoInteract: false,
          autoUpdate: false
        })

        if (cancelled) return

        console.log('[useLive2D] Model loaded!')

        model.interactive = false
        model.eventMode = 'none'
        model.anchor.set(0.5, 0.5)

        // 模型独立显示参数 { scale, yOffset }
        const modelKey = getModelKey(modelPath)
        modelKeyRef.current = modelKey
        const baseCfg = MODEL_CONFIGS[modelKey] || MODEL_CONFIGS.miara
        const isCompactStage = width <= 520
        const cfg = {
          scale: isCompactStage ? (baseCfg.mobileScale || baseCfg.scale) : baseCfg.scale,
          y: isCompactStage ? (baseCfg.mobileY || baseCfg.y) : baseCfg.y
        }

        model.scale.set(cfg.scale)
        model.x = width / 2
        model.y = height * cfg.y

        app.stage.addChild(model)
        modelRef.current = model

        hideModelWatermark(model, modelKey)
        model.internalModel?.on?.('beforeModelUpdate', () => {
          hideModelWatermark(model, modelKey)
        })

        playMotionSafely(model, ['Idle'], 3)

        setIsLoaded(true)
        setError(null)
      } catch (err) {
        console.error('[useLive2D] Load failed:', err)
        setError(err.message)
      }
    }

    if (containerRef.current && modelPath) {
      initLive2D()
    }

    return () => {
      cancelled = true
      // 先销毁 PIXI app（释放 WebGL 上下文）
      if (appRef.current) {
        try {
          appRef.current.destroy(true, { children: true, texture: true })
        } catch (e) {}
        appRef.current = null
      }
      // 清除容器中的 canvas
      if (containerRef.current) {
        const container = containerRef.current
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
      }
      canvasRef.current = null
      modelRef.current = null
      modelKeyRef.current = 'miara'
      setIsLoaded(false)
    }
  }, [containerRef, modelPath])

  useEffect(() => {
    if (!modelRef.current || !isLoaded) return

    const model = modelRef.current

    switch (mainState) {
      case 'idle':
        playMotionSafely(model, ['Idle'], 3)
        break
      case 'listening':
        playMotionSafely(model, ['Listening', 'Idle'], 3)
        break
      case 'thinking':
        playMotionSafely(model, ['Thinking', 'Idle'], 3)
        break
      case 'speaking':
        playMotionSafely(model, ['Speaking', 'Flic', 'Idle'], 3)
        break
    }
  }, [mainState, isLoaded])

  useEffect(() => {
    let lastTime = performance.now()
    const startTime = performance.now()

    const tick = () => {
      const model = modelRef.current
      if (model) {
        try {
          const currentTime = performance.now()
          const deltaTime = Math.min(currentTime - lastTime, 100)
          lastTime = currentTime
          model.update(deltaTime)
          if (mainState === 'idle') {
            ensureIdleMotion(model)
          }
        } catch (err) {}

        // 无动作模型的呼吸待机动画
        const coreModel = model.internalModel.coreModel
        const motionState = model.internalModel.motionManager?.state
        const hasActiveMotion = Boolean(motionState?.currentGroup || motionState?.reservedGroup || motionState?.reservedIdleGroup)
        const elapsed = (performance.now() - startTime) / 1000

        if (!hasActiveMotion) {
          try {
          // 呼吸 (0~1)
          coreModel.setParameterValueById('ParamBreath', 0.65 + 0.35 * Math.sin(elapsed * 1.3))
          // 身体左右微摆 (-0.5~0.5)
          coreModel.setParameterValueById('ParamBodyAngleZ', Math.sin(elapsed * 0.7) * 2)
          // 头部轻微上下 (-0.15~0.15)
          coreModel.setParameterValueById('ParamAngleY', Math.sin(elapsed * 0.9) * 2)
          // 头部轻微左右 (-0.2~0.2)
          coreModel.setParameterValueById('ParamAngleX', Math.sin(elapsed * 1.1 + 0.5) * 2.5)
          } catch (err) {}
        }

        hideModelWatermark(model, modelKeyRef.current)

        if (analyserNode) {
          try {
            const dataArray = new Uint8Array(analyserNode.frequencyBinCount)
            analyserNode.getByteFrequencyData(dataArray)
            const volume = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255
            coreModel.setParameterValueById('ParamMouthOpenY', volume)
          } catch (err) {}
        }
      }
      animationFrameRef.current = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [analyserNode, mainState])

  const playMotion = (motionName) => {
    playMotionSafely(modelRef.current, [motionName], 3)
  }

  const setExpression = (expressionName) => {
    if (modelRef.current) {
      try {
        modelRef.current.expression(expressionName)
      } catch (err) {}
    }
  }

  const updateLipSync = (value) => {
    if (modelRef.current) {
      try {
        modelRef.current.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', value)
      } catch (err) {}
    }
  }

  return {
    model: modelRef.current,
    isLoaded,
    error,
    playMotion,
    setExpression,
    updateLipSync
  }
}
