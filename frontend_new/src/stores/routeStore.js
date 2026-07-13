import { create } from 'zustand'

export const useRouteStore = create((set, get) => ({
  // 是否处于路线导览模式
  isRouteMode: false,

  // RouteGuidePayload 数据
  routePayload: null,

  // 当前高亮景点ID
  activeSpotId: null,

  // 进入路线导览模式
  enterRouteMode: (payload) => set({
    isRouteMode: true,
    routePayload: payload,
    activeSpotId: payload?.spots?.find(s => s.isActive)?.spotId || null
  }),

  // 退出路线导览模式
  exitRouteMode: () => set({
    isRouteMode: false,
    routePayload: null,
    activeSpotId: null
  }),

  // 设置当前高亮景点
  setActiveSpotId: (spotId) => set({ activeSpotId: spotId }),

  // 更新路线数据
  updateRoutePayload: (payload) => set({ routePayload: payload }),

  // 切换到下一个景点
  goToNextSpot: () => {
    const { routePayload, activeSpotId } = get()
    if (!routePayload || !routePayload.spots) return

    const currentIndex = routePayload.spots.findIndex(s => s.spotId === activeSpotId)
    if (currentIndex < routePayload.spots.length - 1) {
      const nextSpot = routePayload.spots[currentIndex + 1]
      set({ activeSpotId: nextSpot.spotId })
    }
  },

  // 切换到上一个景点
  goToPrevSpot: () => {
    const { routePayload, activeSpotId } = get()
    if (!routePayload || !routePayload.spots) return

    const currentIndex = routePayload.spots.findIndex(s => s.spotId === activeSpotId)
    if (currentIndex > 0) {
      const prevSpot = routePayload.spots[currentIndex - 1]
      set({ activeSpotId: prevSpot.spotId })
    }
  },

  // 获取当前景点数据
  getCurrentSpot: () => {
    const { routePayload, activeSpotId } = get()
    if (!routePayload || !routePayload.spots) return null
    return routePayload.spots.find(s => s.spotId === activeSpotId) || null
  },

  // 获取下一个景点数据
  getNextSpot: () => {
    const { routePayload, activeSpotId } = get()
    if (!routePayload || !routePayload.spots) return null
    const currentIndex = routePayload.spots.findIndex(s => s.spotId === activeSpotId)
    if (currentIndex < routePayload.spots.length - 1) {
      return routePayload.spots[currentIndex + 1]
    }
    return null
  }
}))
