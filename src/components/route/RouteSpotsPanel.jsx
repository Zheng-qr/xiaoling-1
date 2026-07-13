import React from 'react'
import { useRouteStore } from '../../stores/routeStore'
import SpotsHeader from './SpotsHeader'
import SpotCard from './SpotCard'

function RouteSpotsPanel({ payload }) {
  const { activeSpotId, setActiveSpotId } = useRouteStore()

  const spots = payload?.spots || []

  return (
    <div style={styles.panel}>
      <SpotsHeader />

      <div style={styles.cardRow}>
        {spots.map((spot) => (
          <SpotCard
            key={spot.spotId}
            spot={spot}
            isActive={spot.spotId === activeSpotId}
            onClick={() => setActiveSpotId(spot.spotId)}
          />
        ))}
      </div>
    </div>
  )
}

const styles = {
  panel: {
    width: '100%',
    height: 'clamp(390px, 53vh, 470px)',
    flex: '0 0 clamp(390px, 53vh, 470px)',
    minHeight: 0,
    padding: '22px 18px 18px',
    position: 'relative',
    zIndex: 4,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '22px',
    background: [
      'radial-gradient(circle at 12% 12%, rgba(255, 255, 255, 0.7), transparent 28%)',
      'linear-gradient(180deg, rgba(255, 252, 242, 0.97) 0%, rgba(249, 244, 230, 0.95) 100%)'
    ].join(', '),
    border: '1.5px solid rgba(181, 143, 95, 0.74)',
    boxShadow: '0 18px 38px rgba(104, 84, 57, 0.14), inset 0 0 0 1px rgba(255, 255, 255, 0.72)'
  },
  cardRow: {
    flex: 1,
    minHeight: 0,
    display: 'grid',
    gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
    gap: '10px'
  }
}

export default RouteSpotsPanel
