const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 静态资源服务
app.use('/assets/map', express.static(path.join(__dirname, '../public/assets/map')));
app.use('/assets/photo', express.static(path.join(__dirname, '../public/assets/photo')));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 回环接口 - 直接返回请求数据
app.post('/api/request', (req, res) => {
  console.log('收到请求:', req.body);
  res.json(req.body);
});

// 景点知识数据
const spotsData = {
  '灵山大佛': {
    id: 'buddha',
    name: '灵山大佛',
    image: '/assets/photo/灵山大佛.jpg',
    description: '灵山大佛高达88米，是世界上最高的青铜佛像之一。',
    details: '灵山大佛坐落于无锡马山秦履峰南侧，大佛所在位置系唐玄奘命名的小灵山，故名灵山大佛。大佛慈颜微笑，广视众生，右手"施无畏印"代表除却痛苦，左手"与愿印"代表给予快乐，均为祝福之相。'
  },
  '梵宫': {
    id: 'fangong',
    name: '梵宫',
    image: '/assets/photo/梵宫.jpg',
    description: '梵宫是灵山胜境中的精华建筑，融合了佛教艺术与现代建筑美学。',
    details: '灵山梵宫坐落于烟波浩淼的太湖之滨，气势恢宏的建筑与宝相庄严的灵山大佛比邻而立，瑰丽璀璨的艺术和独特深厚的佛教文化交相辉映。梵宫建筑气势磅礴，布局庄严和谐，总建筑面积达7万余平方米。'
  },
  '九龙灌浴': {
    id: 'jiulong',
    name: '九龙灌浴',
    image: '/assets/photo/九龙灌浴.jpg',
    description: '九龙灌浴是灵山胜境的标志性景观之一，展现佛陀诞生时的场景。',
    details: '九龙灌浴广场是灵山胜境大型音乐动态群雕。当音乐响起时，巨大的莲花花瓣缓缓绽开，一尊高达7.2米的金身太子佛像从莲花中升起，九龙喷射出九道水柱为太子沐浴。整个过程庄严而震撼。'
  },
  '祥符禅寺': {
    id: 'xiangfu',
    name: '祥符禅寺',
    image: '/assets/photo/祥符禅寺.jpg',
    description: '祥符禅寺是一座千年古刹，历史悠久，环境清幽。',
    details: '祥符禅寺始建于唐代，距今已有一千多年的历史。寺院依山而建，错落有致，古木参天，环境清幽。寺内保存有多处珍贵的文物古迹，是灵山胜境的重要组成部分。'
  },
  '五印坛城': {
    id: 'wuyin',
    name: '五印坛城',
    image: '/assets/photo/五印坛城.jpg',
    description: '五印坛城是仿照藏传佛教风格建造的宏伟建筑。',
    details: '五印坛城占地面积约5000平方米，是灵山胜境中最具藏传佛教特色的建筑群。坛城内供奉着五方佛，建筑风格独特，金碧辉煌，展现了藏传佛教文化的博大精深。'
  },
  '百子戏弥勒': {
    id: 'baizi',
    name: '百子戏弥勒',
    image: '/assets/photo/百子戏弥勒.jpg',
    description: '百子戏弥勒是一组生动有趣的弥勒佛雕塑群。',
    details: '百子戏弥勒大型青铜艺术群雕，长8.5米，宽4.5米，高5.5米。弥勒佛端坐中央，百个童子在弥勒佛身上嬉戏玩耍，形态各异，栩栩如生，充满了生活情趣和欢乐气氛。'
  },
  '灵山大照壁': {
    id: 'dazhaobi',
    name: '灵山大照壁',
    image: '/assets/photo/灵山大照壁.jpg',
    description: '灵山大照壁是大型石刻照壁，展现佛教文化精髓。',
    details: '灵山大照壁全长40米，高8.6米，采用花岗岩雕刻而成。照壁正面刻有"灵山胜会"大型浮雕，再现了佛祖释迦牟尼在灵山说法的壮观场面。'
  },
  '灵山精舍': {
    id: 'jingshe',
    name: '灵山精舍',
    image: '/assets/photo/灵山精舍.jpg',
    description: '灵山精舍是禅修体验场所，环境清幽。',
    details: '灵山精舍位于灵山胜境内，是一处集禅修、住宿、餐饮于一体的综合体验场所。精舍建筑古朴典雅，周围环境清幽宁静，是体验禅修文化的理想之地。'
  },
  '曼飞龙塔': {
    id: 'manfeilong',
    name: '曼飞龙塔',
    image: '/assets/photo/曼飞龙塔.jpg',
    description: '曼飞龙塔是仿傣族风格建造的佛塔。',
    details: '曼飞龙塔仿照云南西双版纳曼飞龙塔建造，塔高20米，塔身洁白，塔尖金黄，具有浓郁的傣族建筑风格。塔周围种植着热带植物，营造出独特的南国风情。'
  },
  '菩提大道': {
    id: 'puti',
    name: '菩提大道',
    image: '/assets/photo/菩提大道.jpg',
    description: '菩提大道两侧种植菩提树，寓意觉悟之路。',
    details: '菩提大道是灵山胜境的主干道，全长约500米。大道两侧种植着从印度引进的菩提树，象征着佛陀在菩提树下觉悟成佛的故事。漫步其中，感受佛法的庄严与宁静。'
  },
  '胜境门楼': {
    id: 'shengjing',
    name: '胜境门楼',
    image: '/assets/photo/胜境门楼.jpg',
    description: '胜境门楼是景区入口标志性建筑。',
    details: '胜境门楼是灵山胜境的正门入口，门楼高20余米，采用仿古建筑风格，气势恢宏。门楼上书"灵山胜境"四个大字，是游客进入景区的第一道风景线。'
  },
  '天下第一掌': {
    id: 'tianxia',
    name: '天下第一掌',
    image: '/assets/photo/天下第一掌.jpg',
    description: '天下第一掌是大型铜铸手掌雕塑。',
    details: '天下第一掌是灵山大佛右手的复制件，掌心法轮常转，掌高11.7米，宽5.5米，手指直径达1米，掌心千辐轮相，庄严无比。游客可以在此与大佛"击掌"，感受佛光普照。'
  }
};

// 路线数据
const routesData = {
  '普通路线': {
    id: 'normal',
    name: '普通路线',
    mapImage: '/assets/map/普通路线.png',
    routeTitle: '推荐游览路线',
    currentLocation: '景区入口',
    nextLocation: '九龙灌浴',
    duration: '约30分钟',
    summary: '入口 → 九龙灌浴 → 灵山大佛 → 梵宫',
    spots: [
      { spotId: 'jiulong', spotName: '九龙灌浴', spotImage: '/assets/photo/九龙灌浴.jpg', spotDescription: '九龙吐水，灌浴太子，是灵山胜境最具仪式感的迎宾景观。', isActive: true },
      { spotId: 'buddha', spotName: '灵山大佛', spotImage: '/assets/photo/灵山大佛.jpg', spotDescription: '庄严宏伟，是景区最具代表性的核心地标。' },
      { spotId: 'fangong', spotName: '梵宫', spotImage: '/assets/photo/梵宫.jpg', spotDescription: '融合佛教艺术与建筑美学，空间恢弘而华丽。' }
    ]
  },
  '历史文化路线': {
    id: 'history',
    name: '历史文化路线',
    mapImage: '/assets/map/历史文化路线.png',
    routeTitle: '历史文化路线',
    currentLocation: '胜境门楼',
    nextLocation: '祥符禅寺',
    duration: '约45分钟',
    summary: '胜境门楼 → 祥符禅寺 → 灵山大佛 → 梵宫',
    spots: [
      { spotId: 'shengjing', spotName: '胜境门楼', spotImage: '/assets/photo/胜境门楼.jpg', spotDescription: '景区入口标志性建筑，气势恢宏。', isActive: true },
      { spotId: 'xiangfu', spotName: '祥符禅寺', spotImage: '/assets/photo/祥符禅寺.jpg', spotDescription: '千年古刹，历史悠久，环境清幽。' },
      { spotId: 'buddha', spotName: '灵山大佛', spotImage: '/assets/photo/灵山大佛.jpg', spotDescription: '高达88米的青铜佛像，世界之最。' }
    ]
  },
  '亲子路线': {
    id: 'family',
    name: '亲子路线',
    mapImage: '/assets/map/亲子路线.png',
    routeTitle: '亲子推荐路线',
    currentLocation: '景区入口',
    nextLocation: '百子戏弥勒',
    duration: '约40分钟',
    summary: '入口 → 百子戏弥勒 → 九龙灌浴 → 灵山大佛',
    spots: [
      { spotId: 'baizi', spotName: '百子戏弥勒', spotImage: '/assets/photo/百子戏弥勒.jpg', spotDescription: '生动有趣的弥勒佛雕塑群，深受孩子喜爱。', isActive: true },
      { spotId: 'jiulong', spotName: '九龙灌浴', spotImage: '/assets/photo/九龙灌浴.jpg', spotDescription: '壮观的音乐喷泉表演，孩子们的最爱。' },
      { spotId: 'buddha', spotName: '灵山大佛', spotImage: '/assets/photo/灵山大佛.jpg', spotDescription: '庄严宏伟，是景区最具代表性的核心地标。' }
    ]
  },
  '自然风光路线': {
    id: 'nature',
    name: '自然风光路线',
    mapImage: '/assets/map/自然风光路线.png',
    routeTitle: '自然风光路线',
    currentLocation: '菩提大道',
    nextLocation: '灵山精舍',
    duration: '约50分钟',
    summary: '菩提大道 → 灵山精舍 → 曼飞龙塔 → 灵山大佛',
    spots: [
      { spotId: 'puti', spotName: '菩提大道', spotImage: '/assets/photo/菩提大道.jpg', spotDescription: '两侧种植菩提树，寓意觉悟之路。', isActive: true },
      { spotId: 'jingshe', spotName: '灵山精舍', spotImage: '/assets/photo/灵山精舍.jpg', spotDescription: '禅修体验场所，环境清幽。' },
      { spotId: 'manfeilong', spotName: '曼飞龙塔', spotImage: '/assets/photo/曼飞龙塔.jpg', spotDescription: '仿傣族风格建造的佛塔，异域风情。' }
    ]
  }
};

// 关键词匹配函数
function matchResponse(question) {
  // 景点关键词匹配
  const spotKeywords = ['灵山大佛', '梵宫', '九龙灌浴', '祥符禅寺', '五印坛城', '百子戏弥勒', '灵山大照壁', '灵山精舍', '曼飞龙塔', '菩提大道', '胜境门楼', '天下第一掌'];
  for (const keyword of spotKeywords) {
    if (question.includes(keyword) && spotsData[keyword]) {
      return {
        type: 'knowledge',
        data: spotsData[keyword]
      };
    }
  }

  // 路线关键词匹配
  const routeKeywords = ['普通路线', '历史文化', '亲子', '自然风光'];
  for (const keyword of routeKeywords) {
    if (question.includes(keyword) && routesData[keyword]) {
      return {
        type: 'route_guidance',
        data: routesData[keyword]
      };
    }
  }

  // 路线相关通用关键词
  if (question.includes('路线') || question.includes('推荐') || question.includes('怎么走')) {
    return {
      type: 'route_guidance',
      data: routesData['普通路线']
    };
  }

  // 默认返回灵山大佛
  return {
    type: 'knowledge',
    data: {
      id: 'default',
      name: '灵山景区',
      image: '/assets/photo/灵山大佛.jpg',
      description: '欢迎来到灵山景区！',
      details: '灵山景区位于江苏省无锡市，是国家5A级旅游景区。景区内有灵山大佛、梵宫、九龙灌浴等著名景点，是集佛教文化、自然风光于一体的综合性旅游景区。'
    }
  };
}

// 模拟提问接口 - 返回模拟的WebSocket消息序列
app.post('/api/question', (req, res) => {
  const { content, responseId } = req.body;
  console.log('收到问题:', content);

  // 关键词匹配
  const match = matchResponse(content);
  const respId = responseId || `resp_${Date.now()}`;

  if (match.type === 'route_guidance') {
    // 返回路线导览数据
    res.json({
      type: 'route_guidance',
      responseId: respId,
      payload: {
        responseId: respId,
        routeId: match.data.id,
        routeTitle: match.data.routeTitle,
        currentLocation: match.data.currentLocation,
        nextLocation: match.data.nextLocation,
        estimatedDuration: match.data.duration,
        routeSummary: match.data.summary,
        mapImageUrl: match.data.mapImage,
        currentSpotId: match.data.spots[0]?.spotId,
        nextSpotId: match.data.spots[1]?.spotId,
        spots: match.data.spots
      }
    });
  } else {
    // 返回知识卡片数据
    res.json({
      type: 'knowledge',
      responseId: respId,
      content: match.data.description,
      payload: {
        responseId: respId,
        title: match.data.name,
        imageUrl: match.data.image,
        description: match.data.details,
        keywords: [match.data.name]
      },
      sentences: [
        {
          segmentId: 'seg_001',
          content: match.data.description,
          emotion: 'cheerful'
        },
        {
          segmentId: 'seg_002',
          content: match.data.details,
          emotion: 'neutral'
        }
      ]
    });
  }
});

// 获取地图路线列表
app.get('/api/routes', (req, res) => {
  const routes = Object.values(routesData).map(r => ({
    id: r.id,
    name: r.name,
    image: r.mapImage
  }));
  res.json(routes);
});

// 获取景点列表
app.get('/api/spots', (req, res) => {
  const spots = Object.values(spotsData).map(s => ({
    id: s.id,
    name: s.name,
    image: s.image,
    description: s.description
  }));
  res.json(spots);
});

app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
});
