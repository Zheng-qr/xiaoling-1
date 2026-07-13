import React, { useState, useRef, useCallback, useEffect } from 'react'
import PresetButtons from './PresetButtons'
import { useAppStore } from '../../stores/appStore'
import { useRouteStore } from '../../stores/routeStore'

function ControlDock() {
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })

  const endTour = useCallback(() => {
    useAppStore.getState().closePanel(false)
    useAppStore.getState().stopThinking()
    useAppStore.getState().transitionTo('idle')
    useRouteStore.getState().exitRouteMode()
    setTimeout(() => {
      useAppStore.getState().showSatisfactionCard()
    }, 5000)
  }, [])

  // 鼠标按下开始拖拽
  const handleMouseDown = useCallback((e) => {
    // 只在拖拽手柄上触发
    if (e.target.closest('[data-drag-handle]')) {
      e.preventDefault()
      setIsDragging(true)
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      }
    }
  }, [position])

  // 鼠标移动
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return

    const newX = e.clientX - dragStartRef.current.x
    const newY = e.clientY - dragStartRef.current.y

    // 边界检查
    const maxX = window.innerWidth - 300
    const maxY = window.innerHeight - 400

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }, [isDragging])

  // 鼠标松开结束拖拽
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 添加全局事件监听
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div
      style={{
        ...styles.container,
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseDown={handleMouseDown}
    >
      <PresetButtons onEndTour={endTour} />
    </div>
  )
}

const styles = {
  container: {
    position: 'absolute',
    zIndex: 20
  }
}

export default ControlDock
