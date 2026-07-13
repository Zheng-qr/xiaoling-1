import React from 'react'
import { useRouteStore } from '../../stores/routeStore'
import RouteAvatarStage from './RouteAvatarStage'
import RouteMapPanel from './RouteMapPanel'
import RouteSpotsPanel from './RouteSpotsPanel'

function RouteGuideLayout() {
  const { routePayload, exitRouteMode } = useRouteStore()

  return (
    <div style={styles.container} className="route-mode-bg">
      <div style={styles.shell}>
        {/* 左侧景点与数字人 */}
        <aside style={styles.leftColumn}>
          <RouteSpotsPanel payload={routePayload} />
          <RouteAvatarStage />
        </aside>

        {/* 右侧路线导览卡 */}
        <main style={styles.rightColumn}>
          <RouteMapPanel payload={routePayload} onBack={exitRouteMode} />
        </main>
      </div>
    </div>
  )
}

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: 'clamp(22px, 2.2vw, 34px)',
    overflow: 'hidden'
  },
  shell: {
    width: '100%',
    height: '100%',
    maxWidth: '1500px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(360px, 420px) minmax(0, 1fr)',
    gap: 'clamp(28px, 3vw, 44px)',
    alignItems: 'stretch'
  },
  leftColumn: {
    position: 'relative',
    minWidth: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 2
  },
  rightColumn: {
    minWidth: 0,
    height: '100%',
    minHeight: 0,
    display: 'flex',
    alignItems: 'stretch',
    overflow: 'hidden',
    padding: '0'
  }
}

export default RouteGuideLayout
