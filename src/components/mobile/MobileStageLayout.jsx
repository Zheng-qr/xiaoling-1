import React from 'react'
import { useAppStore } from '../../stores/appStore'
import MobileAvatarStage from './MobileAvatarStage'
import MobileAnswerStream from './MobileAnswerStream'
import MobileInputBar from './MobileInputBar'
import HistoryOverlay from '../history/HistoryOverlay'
import SatisfactionCard from '../satisfaction/SatisfactionCard'
import ImageModal from '../common/ImageModal'

function MobileStageLayout() {
  const { historyOpen, imageModal, closeImageModal } = useAppStore()

  return (
    <div className="mobile-stage-layout main-mode-bg" style={styles.container}>
      <MobileAvatarStage />
      <MobileAnswerStream />
      <MobileInputBar />

      {historyOpen && <HistoryOverlay isMobile />}
      <SatisfactionCard />

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
    height: '100dvh',
    minHeight: '100dvh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    color: '#3C352C',
  },
}

export default MobileStageLayout

