import React from 'react'

function MapViewport({ payload }) {
  return (
    <div style={styles.container}>
      {payload?.mapImageUrl ? (
        <>
          <img
            src={payload.mapImageUrl}
            alt="路线图"
            style={styles.mapImage}
          />
          <div style={styles.mapVignette} />
        </>
      ) : (
        <div style={styles.placeholder}>路线地图加载中...</div>
      )}
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    flex: 1,
    minHeight: 0,
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#F4F0E6',
    border: '1px solid rgba(217, 199, 168, 0.82)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapImage: {
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    display: 'block',
    filter: 'saturate(1.05) contrast(1.02)'
  },
  mapVignette: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, rgba(255, 251, 242, 0.08), transparent 22%, transparent 78%, rgba(255, 251, 242, 0.12))',
    pointerEvents: 'none'
  },
  placeholder: {
    color: '#8B8578',
    fontSize: '16px'
  }
}

export default MapViewport
