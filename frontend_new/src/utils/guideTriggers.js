export const GUIDE_INTENTS = {
  ROUTE: 'route',
  SPOT: 'spot',
}

const CONTROL_TAGS = {
  '路线咨询': GUIDE_INTENTS.ROUTE,
  '路线推荐': GUIDE_INTENTS.ROUTE,
  '推荐路线': GUIDE_INTENTS.ROUTE,
  '景点介绍': GUIDE_INTENTS.SPOT,
  '景点讲解': GUIDE_INTENTS.SPOT,
  '景点知识': GUIDE_INTENTS.SPOT,
}

const SPOTS = {
  '灵山大佛': {
    spotId: 'lingshan-buddha',
    title: '灵山大佛',
    imageUrl: '/assets/photo/灵山大佛.jpg',
    aliases: ['灵山大佛', '大佛'],
    description: '灵山大佛高达88米，是灵山胜境最具代表性的核心地标，适合了解佛教文化与景区主轴。',
    keywords: ['灵山大佛', '佛教文化', '核心地标'],
  },
  '灵山梵宫': {
    spotId: 'lingshan-fangong',
    title: '灵山梵宫',
    imageUrl: '/assets/photo/梵宫.jpg',
    aliases: ['灵山梵宫', '梵宫'],
    description: '灵山梵宫融合佛教艺术与现代建筑美学，内部装饰华美，是景区重要的文化体验空间。',
    keywords: ['灵山梵宫', '佛教艺术', '建筑美学'],
  },
  '九龙灌浴': {
    spotId: 'jiulong-guanyu',
    title: '九龙灌浴',
    imageUrl: '/assets/photo/九龙灌浴.jpg',
    aliases: ['九龙灌浴'],
    description: '九龙灌浴是大型音乐动态群雕，通过喷泉、音乐与雕塑演绎佛祖诞生的经典场景。',
    keywords: ['九龙灌浴', '动态群雕', '亲子体验'],
  },
  '五印坛城': {
    spotId: 'wuyin-tancheng',
    title: '五印坛城',
    imageUrl: '/assets/photo/五印坛城.jpg',
    aliases: ['五印坛城'],
    description: '五印坛城具有鲜明的藏传佛教建筑特色，适合感受庄严、绚丽的宗教文化氛围。',
    keywords: ['五印坛城', '藏传佛教', '文化建筑'],
  },
  '祥符禅寺': {
    spotId: 'xiangfu-chansi',
    title: '祥符禅寺',
    imageUrl: '/assets/photo/祥符禅寺.jpg',
    aliases: ['祥符禅寺'],
    description: '祥符禅寺历史悠久，环境清幽，是灵山胜境中适合静心游览和了解寺院文化的景点。',
    keywords: ['祥符禅寺', '寺院文化', '静心游览'],
  },
  '百子戏弥勒': {
    spotId: 'baizi-mile',
    title: '百子戏弥勒',
    imageUrl: '/assets/photo/百子戏弥勒.jpg',
    aliases: ['百子戏弥勒', '百子戏弥勒佛'],
    description: '百子戏弥勒以生动有趣的雕塑群展现童趣与祥和氛围，很适合亲子家庭停留拍照。',
    keywords: ['百子戏弥勒', '亲子', '童趣雕塑'],
  },
}

const ROUTES = [
  {
    routeId: 'history-culture',
    routeTitle: '历史文化爱好者路线',
    aliases: ['历史文化爱好者路线', '历史文化路线', '历史文化', '文化爱好者'],
    mapImageUrl: '/assets/map/历史文化路线.png',
    currentLocation: '景区入口',
    nextLocation: '祥符禅寺',
    estimatedDuration: '约3小时',
    routeSummary: '景区入口 -> 祥符禅寺 -> 五印坛城 -> 灵山梵宫 -> 灵山大佛',
    spots: ['祥符禅寺', '五印坛城', '灵山梵宫', '灵山大佛'],
  },
  {
    routeId: 'nature-view',
    routeTitle: '自然风光爱好者路线',
    aliases: ['自然风光爱好者路线', '自然风光路线', '自然风光', '自然路线'],
    mapImageUrl: '/assets/map/自然风光路线.png',
    currentLocation: '景区入口',
    nextLocation: '九龙灌浴',
    estimatedDuration: '约2.5小时',
    routeSummary: '景区入口 -> 九龙灌浴 -> 五印坛城 -> 灵山梵宫 -> 灵山大佛',
    spots: ['九龙灌浴', '五印坛城', '灵山梵宫', '灵山大佛'],
  },
  {
    routeId: 'family',
    routeTitle: '亲子家庭路线',
    aliases: ['亲子家庭路线', '亲子路线', '亲子家庭', '带孩子', '小朋友'],
    mapImageUrl: '/assets/map/亲子路线.png',
    currentLocation: '景区入口',
    nextLocation: '百子戏弥勒',
    estimatedDuration: '约2小时',
    routeSummary: '景区入口 -> 百子戏弥勒 -> 九龙灌浴 -> 灵山大佛',
    spots: ['百子戏弥勒', '九龙灌浴', '灵山大佛'],
  },
  {
    routeId: 'normal',
    routeTitle: '普通游玩路线',
    aliases: ['普通游玩路线', '普通路线', '常规路线', '默认路线'],
    mapImageUrl: '/assets/map/普通路线.png',
    currentLocation: '景区入口',
    nextLocation: '九龙灌浴',
    estimatedDuration: '约2小时',
    routeSummary: '景区入口 -> 九龙灌浴 -> 灵山大佛 -> 灵山梵宫',
    spots: ['九龙灌浴', '灵山大佛', '灵山梵宫'],
  },
]

export function consumeControlText(input, { final = false } = {}) {
  const source = String(input || '')
  const intents = []
  let cleanText = ''
  let rest = ''
  let cursor = 0

  while (cursor < source.length) {
    const start = source.indexOf('【', cursor)
    if (start === -1) {
      cleanText += source.slice(cursor)
      break
    }

    cleanText += source.slice(cursor, start)
    const end = source.indexOf('】', start + 1)

    if (end === -1) {
      if (final) {
        cleanText += source.slice(start)
      } else {
        rest = source.slice(start)
      }
      break
    }

    const tag = source.slice(start + 1, end).trim()
    const intent = CONTROL_TAGS[tag]

    if (intent) {
      intents.push(intent)
    } else {
      cleanText += source.slice(start, end + 1)
    }

    cursor = end + 1
  }

  return { cleanText, intents, rest }
}

export function chooseControlIntent(currentIntent, intents = []) {
  if (intents.includes(GUIDE_INTENTS.ROUTE)) return GUIDE_INTENTS.ROUTE
  if (intents.includes(GUIDE_INTENTS.SPOT)) return GUIDE_INTENTS.SPOT
  return currentIntent
}

export function matchRoutePayload(text, { allowDefault = false } = {}) {
  const normalized = normalize(text)
  const route = ROUTES.find((item) =>
    item.aliases.some((alias) => normalized.includes(normalize(alias)))
  )

  if (!route && !allowDefault) return null
  return buildRoutePayload(route || ROUTES[3])
}

export function matchSpotPayload(text) {
  const normalized = normalize(text)
  const spot = Object.values(SPOTS).find((item) =>
    item.aliases.some((alias) => normalized.includes(normalize(alias)))
  )

  if (!spot) return null

  return {
    title: spot.title,
    imageUrl: spot.imageUrl,
    description: spot.description,
    keywords: spot.keywords,
  }
}

function buildRoutePayload(route) {
  const spots = route.spots
    .map((name, index) => {
      const spot = SPOTS[name]
      if (!spot) return null

      return {
        spotId: spot.spotId,
        spotName: spot.title,
        spotImageUrl: spot.imageUrl,
        spotDescription: spot.description,
        isActive: index === 0,
      }
    })
    .filter(Boolean)

  return {
    routeId: route.routeId,
    routeTitle: route.routeTitle,
    currentLocation: route.currentLocation,
    nextLocation: route.nextLocation,
    estimatedDuration: route.estimatedDuration,
    routeSummary: route.routeSummary,
    mapImageUrl: route.mapImageUrl,
    currentSpotId: spots[0]?.spotId || null,
    nextSpotId: spots[1]?.spotId || null,
    spots,
  }
}

function normalize(value) {
  return String(value || '')
    .replace(/\s+/g, '')
    .replace(/[，。、“”‘’！!？?：:；;（）()[\]{}<>《》\-_*#`~|]/g, '')
}
