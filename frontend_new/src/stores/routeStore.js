import { create } from 'zustand'

export const useRouteStore = create((set, get) => ({
  isRouteMode: false,
  routePayload: null,
  activeSpotId: null,

  enterRouteMode: (payload) => set({
    isRouteMode: true,
    routePayload: payload,
    activeSpotId: payload?.spots?.find((spot) => spot.isActive)?.spotId || null,
  }),

  exitRouteMode: () => set({
    isRouteMode: false,
  }),

  reopenRouteMode: () => {
    const { routePayload, activeSpotId } = get()
    if (!routePayload) return

    set({
      isRouteMode: true,
      activeSpotId: activeSpotId || routePayload?.spots?.find((spot) => spot.isActive)?.spotId || null,
    })
  },

  setActiveSpotId: (spotId) => set({ activeSpotId: spotId }),

  updateRoutePayload: (payload) => set({ routePayload: payload }),

  goToNextSpot: () => {
    const { routePayload, activeSpotId } = get()
    if (!routePayload?.spots) return

    const currentIndex = routePayload.spots.findIndex((spot) => spot.spotId === activeSpotId)
    if (currentIndex < routePayload.spots.length - 1) {
      const nextSpot = routePayload.spots[currentIndex + 1]
      set({ activeSpotId: nextSpot.spotId })
    }
  },

  goToPrevSpot: () => {
    const { routePayload, activeSpotId } = get()
    if (!routePayload?.spots) return

    const currentIndex = routePayload.spots.findIndex((spot) => spot.spotId === activeSpotId)
    if (currentIndex > 0) {
      const prevSpot = routePayload.spots[currentIndex - 1]
      set({ activeSpotId: prevSpot.spotId })
    }
  },

  getCurrentSpot: () => {
    const { routePayload, activeSpotId } = get()
    if (!routePayload?.spots) return null
    return routePayload.spots.find((spot) => spot.spotId === activeSpotId) || null
  },

  getNextSpot: () => {
    const { routePayload, activeSpotId } = get()
    if (!routePayload?.spots) return null

    const currentIndex = routePayload.spots.findIndex((spot) => spot.spotId === activeSpotId)
    if (currentIndex < routePayload.spots.length - 1) {
      return routePayload.spots[currentIndex + 1]
    }

    return null
  },
}))
