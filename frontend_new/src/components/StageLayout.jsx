import React from 'react'
import { useAppStore } from '../stores/appStore'
import AvatarStage from './avatar/AvatarStage'
import SubtitleDock from './subtitle/SubtitleDock'
import ControlDock from './control/ControlDock'
import InputBar from './control/InputBar'
import ScrollPanel from './panel/ScrollPanel'
import HistoryOverlay from './history/HistoryOverlay'
import SatisfactionCard from './satisfaction/SatisfactionCard'
import ImageModal from './common/ImageModal'

function StageLayout() {
  const { mainState, historyOpen, panelOpen, imageModal, closeImageModal } = useAppStore()

  return (
    <div className="stage-layout main-mode-bg" style={styles.container}>
      {/* 背景层 */}
      <div className="background-layer" style={styles.backgroundLayer} />

      {/* 数字人舞台 */}
      <AvatarStage />

      {/* 字幕区 */}
      <SubtitleDock />

      {/* 控制区 - 预设按钮面板（右上角，可拖拽） */}
      <ControlDock />

      {/* 底部输入栏 */}
      <InputBar />

      {/* 画轴 */}
      {panelOpen && <ScrollPanel />}

      {/* 历史记录 */}
      {historyOpen && <HistoryOverlay />}

      {/* 满意度评分 */}
      <SatisfactionCard />

      {/* 图片放大模态框 */}
      {imageModal.visible && (
        <ImageModal
          imageUrl={imageModal.imageUrl}
          onClose={closeImageModal}
        />
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0
  }
}

export default StageLayout
