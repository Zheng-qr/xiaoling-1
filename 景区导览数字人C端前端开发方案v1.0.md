# 景区导览数字人 C 端前端开发方案 v1.0

## 一、状态机设计

### 1.1 主状态（5种）

| 状态 | 说明 | 触发条件 |
|------|------|---------|
| IDLE | 待机 | 初始状态 / 音频全部播放完毕 |
| LISTENING | 聆听 | 用户开始输入 |
| THINKING | 思考视频播放中 | 用户发送问题后立即触发 |
| SPEAKING | 讲解（音频播放中） | 首段音频开始播放 |
| ENDING | 结束导览 | 用户点击结束 |

```javascript
const MainState = {
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
  ENDING: 'ending'
}
```

### 1.2 叠加UI状态

| 状态 | 类型 | 说明 |
|------|------|------|
| panelOpen | boolean | 画轴是否打开 |
| panelType | 'knowledge' \| 'map' \| null | 画轴类型 |
| panelSegmentId | string \| null | 当前画轴绑定的段落ID |
| panelPayload | object \| null | 画轴内容数据 |
| historyOpen | boolean | 历史记录是否打开 |
| answerExpanded | boolean | 当前回答是否展开 |
| controlIntensity | 0-1 | 控制区显示强度 |
| thinkingVideoVisible | boolean | 思考视频是否显示 |

```javascript
const OverlayState = {
  panelOpen: false,
  panelType: null,
  panelSegmentId: null,
  panelPayload: null,
  historyOpen: false,
  answerExpanded: false,
  controlIntensity: 1,
  thinkingVideoVisible: false
}
```

### 1.3 状态转换流程

```
用户发送问题
    │
    ├─ 立即: thinkingVideoVisible = true, 主状态 → THINKING
    ├─ 发送: {type: "question", content, responseId}
    │
    ├─ 收到 stream_start
    │   └─ 仅标记后端开始响应，不切换主状态
    │
    ├─ 收到 token（持续）
    │   └─ 累积到 fullAnswer，不驱动字幕
    │
    ├─ 收到 sentence（含 segmentId）
    │   └─ 进入 sentenceQueue，不更新字幕
    │
    ├─ 收到 audio_start（含 segmentId, sampleRate, channels）
    │   └─ 标记 activeSegmentId
    │
    ├─ 收到 binary PCM16
    │   └─ 归属到 activeSegmentId，加入播放队列
    │
    ├─ 前端音频开始播放（某segment的第一个chunk播放时）
    │   ├─ 主状态 → SPEAKING（首次）
    │   ├─ thinkingVideoVisible = false
    │   └─ 从sentenceQueue取出句子，更新字幕
    │
    ├─ 收到 audio_end（含 segmentId）
    │   └─ 标记该segment后端发送完毕
    │
    ├─ 前端 playback_end（某segment播放完毕）
    │   ├─ 如果 panelSegmentId === segmentId → 自动关闭画轴
    │   └─ 检查是否所有segment都播放完毕
    │
    ├─ 收到 stream_end
    │   └─ 标记 streamEndReceived = true
    │       检查是否可以 finishResponse
    │
    ├─ 所有音频播放完毕（所有 segment playback_end）
    │   └─ 标记 allSegmentsDone = true
    │       检查是否可以 finishResponse
    │       条件：streamEndReceived && allSegmentsDone → finishResponse
    │       主状态 → IDLE，清理 responseId 和手动关闭记录
    │
    └─ 收到 satisfaction_request
        └─ 显示满意度UI
```

---

## 二、WebSocket 协议规范

### 2.1 前端 → 后端消息

| 类型 | 字段 | 说明 |
|------|------|------|
| question | content, responseId | 用户提问 |
| ping | - | 心跳 |
| set_voice | voice | 设置音色 |
| set_style | style | 设置风格 |
| satisfaction | score, responseId | 满意度评分 |
| panel_close_request | responseId, segmentId | 手动画轴关闭 |

```javascript
// 用户提问
{"type": "question", "responseId": "resp_20260610_001", "content": "灵山大佛有多高？"}

// 心跳
{"type": "ping"}

// 设置音色
{"type": "set_voice", "voice": "茉莉"}

// 设置风格
{"type": "set_style", "style": "cheerful"}

// 满意度评分
{"type": "satisfaction", "score": 5, "responseId": "resp_20260610_001"}

// 手动画轴关闭
{"type": "panel_close_request", "responseId": "resp_xxx", "segmentId": "seg_001"}
```

### 2.2 后端 → 前端消息

| 类型 | 字段 | 说明 |
|------|------|------|
| connected | client_id, voice, message | 连接成功 |
| stream_start | - | 后端开始响应 |
| intent | intent, confidence | 意图识别结果 |
| token | responseId, content | 流式文本token |
| emotion | responseId, content, emotion | 情绪标签 |
| sentence | responseId, segmentId, content, emotion | 完整句子 |
| audio_start | responseId, segmentId, sampleRate, channels, format | 音频开始 |
| audio_end | responseId, segmentId | 音频结束（后端发送完毕） |
| panel_open | responseId, segmentId, panelType, payload | 画轴打开 |
| panel_close | responseId, segmentId | 画轴关闭（后端强制） |
| stream_end | stats | 响应结束 |
| satisfaction_request | responseId, session_id, message_id | 请求满意度评分 |
| voice_changed | voice | 音色已更改 |
| style_changed | style | 风格已更改 |
| pong | - | 心跳响应 |
| error | message | 错误消息 |
| **binary** | PCM16音频数据 | 二进制音频帧 |

### 2.3 消息序列示例

```
前端 → 后端: {"type": "question", "responseId": "resp_001", "content": "灵山大佛有多高？"}

后端 → 前端:
  1. {"type": "stream_start"}
  2. {"type": "intent", "intent": "knowledge", "confidence": 0.85}
  3. {"type": "token", "responseId": "resp_001", "content": "灵"}
  4. {"type": "token", "responseId": "resp_001", "content": "山"}
  5. {"type": "emotion", "responseId": "resp_001", "content": "cheerful", "emotion": "cheerful"}
  6. {"type": "sentence", "responseId": "resp_001", "segmentId": "seg_001", "content": "灵山大佛高达88米，", "emotion": "cheerful"}
  7. {"type": "panel_open", "responseId": "resp_001", "segmentId": "seg_001", "panelType": "knowledge", "payload": {...}}
  8. {"type": "audio_start", "responseId": "resp_001", "segmentId": "seg_001", "sampleRate": 24000, "channels": 1, "format": "pcm16"}
  9. [binary PCM16 chunk] × N
  10. {"type": "audio_end", "responseId": "resp_001", "segmentId": "seg_001"}
  11. {"type": "sentence", "responseId": "resp_001", "segmentId": "seg_002", "content": "是世界上最高的青铜佛像。", "emotion": "cheerful"}
  12. {"type": "audio_start", "responseId": "resp_001", "segmentId": "seg_002", ...}
  13. [binary PCM16 chunk] × N
  14. {"type": "audio_end", "responseId": "resp_001", "segmentId": "seg_002"}
  15. {"type": "stream_end", "stats": {...}}
  16. {"type": "satisfaction_request", "responseId": "resp_001", "session_id": "...", "message_id": "..."}
```

### 2.4 Binary PCM16 归属规则

```
规则：audio_start 到 audio_end 之间的所有 binary 都属于同一个 active segment

前端维护：
- activeSegmentId: 当前正在接收音频的segmentId
- audio_start 到达 → activeSegmentId = segmentId
- binary 到达 → 归属到 activeSegmentId
- audio_end 到达 → activeSegmentId = null

如果 binary 不带 segmentId，则必须规定 audio_start 到 audio_end 之间的
所有 binary 都属于同一个 active segment
```

---

## 三、核心数据结构

### 3.1 AppStore (Zustand)

```javascript
const useAppStore = create((set, get) => ({
  // 主状态
  mainState: 'idle',

  // 叠加状态
  panelOpen: false,
  panelType: null,
  panelSegmentId: null,
  panelPayload: null,
  historyOpen: false,
  answerExpanded: false,
  controlIntensity: 1,
  thinkingVideoVisible: false,

  // 响应标识
  currentResponseId: null,
  lastCompletedResponseId: null,

  // 情绪
  currentEmotion: 'neutral',

  // 手动关闭记录（response生命周期结束后清理）
  // key 格式: responseId:segmentId，不可变 Set 更新
  manuallyClosedSegmentIds: new Set(),

  // 状态转换
  transitionTo: (newState) => set({ mainState: newState }),

  // Thinking控制
  startThinking: () => set({
    thinkingVideoVisible: true,
    mainState: 'thinking'
  }),
  stopThinking: () => set({
    thinkingVideoVisible: false
  }),

  // 画轴控制
  openPanel: (responseId, segmentId, type, payload) => {
    const { manuallyClosedSegmentIds, currentResponseId } = get();
    const key = `${currentResponseId}:${segmentId}`;
    if (manuallyClosedSegmentIds.has(key)) return;
    set({
      panelOpen: true,
      panelType: type,
      panelSegmentId: segmentId,
      panelPayload: payload
    });
  },

  closePanel: (isManual = false) => {
    const { panelSegmentId, currentResponseId } = get();
    if (isManual) {
      const key = `${currentResponseId}:${panelSegmentId}`;
      // 不可变 Set 更新
      set(state => ({
        manuallyClosedSegmentIds: new Set([...state.manuallyClosedSegmentIds, key])
      }));
    }
    set({
      panelOpen: false,
      panelType: null,
      panelSegmentId: null,
      panelPayload: null
    });
  },

  // 响应生命周期清理
  clearResponse: () => set(state => ({
    lastCompletedResponseId: state.currentResponseId,
    currentResponseId: null,
    manuallyClosedSegmentIds: new Set()
  }))
}));
```

### 3.2 AudioStore (Zustand)

```javascript
const useAudioStore = create((set, get) => ({
  // 播放状态
  isPlaying: false,

  // 活跃segment
  activeSegmentId: null,        // 正在接收音频的segment
  playingSegmentId: null,       // 正在播放的segment

  // segment队列
  segmentQueues: {},            // {segmentId: [chunk1, chunk2, ...]}
  segmentStatus: {},            // {segmentId: 'receiving'|'ready'|'playing'|'done'}

  // 音频开始（后端）
  handleAudioStart: (segmentId, sampleRate, channels) => set({
    activeSegmentId: segmentId,
    segmentStatus: {
      ...get().segmentStatus,
      [segmentId]: 'receiving'
    }
  }),

  // 接收binary
  handleBinaryChunk: (data) => {
    const { activeSegmentId, segmentQueues } = get();
    if (!activeSegmentId) return;
    const queue = segmentQueues[activeSegmentId] || [];
    set({
      segmentQueues: {
        ...segmentQueues,
        [activeSegmentId]: [...queue, data]
      }
    });
  },

  // 音频结束（后端发送完毕）
  handleAudioEnd: (segmentId) => set({
    activeSegmentId: null,
    segmentStatus: {
      ...get().segmentStatus,
      [segmentId]: 'ready'
    }
  }),

  // 播放开始（前端）
  handlePlaybackStart: (segmentId) => set({
    isPlaying: true,
    playingSegmentId: segmentId,
    segmentStatus: {
      ...get().segmentStatus,
      [segmentId]: 'playing'
    }
  }),

  // 播放结束（前端 playback_end）
  handlePlaybackEnd: (segmentId) => {
    const { segmentQueues, segmentStatus } = get();
    const newQueues = { ...segmentQueues };
    delete newQueues[segmentId];
    set({
      isPlaying: Object.keys(newQueues).length > 0,
      playingSegmentId: null,
      segmentQueues: newQueues,
      segmentStatus: {
        ...segmentStatus,
        [segmentId]: 'done'
      }
    });
  }
}));
```

### 3.3 MessageStore (Zustand)

```javascript
const useMessageStore = create((set, get) => ({
  // 消息历史
  messages: [],

  // 当前回答（token累积）
  fullAnswer: '',

  // 字幕状态
  previousSentence: '',
  currentSentence: '',

  // 句子队列（等待音频播放）
  sentenceQueue: [],  // [{content, segmentId, emotion, responseId}]

  // 添加token（不驱动字幕）
  addToken: (token) => set(state => ({
    fullAnswer: state.fullAnswer + token
  })),

  // 添加句子到队列
  enqueueSentence: (sentence) => set(state => ({
    sentenceQueue: [...state.sentenceQueue, sentence]
  })),

  // 取出句子更新字幕（音频播放时调用）
  dequeueSentence: (segmentId) => {
    const { sentenceQueue } = get();
    const index = sentenceQueue.findIndex(s => s.segmentId === segmentId);
    if (index === -1) return null;
    const sentence = sentenceQueue[index];
    const newQueue = [...sentenceQueue];
    newQueue.splice(index, 1);
    set(state => ({
      sentenceQueue: newQueue,
      previousSentence: state.currentSentence,
      currentSentence: sentence.content
    }));
    return sentence;
  },

  // 完成一轮回答
  // 必须同时满足：stream_end 已收到 + 所有 segment 已 playback_end
  finishResponse: () => {
    const { streamEndReceived, allSegmentsDone } = get();
    if (!streamEndReceived || !allSegmentsDone) return false;

    set(state => ({
      messages: [
        ...state.messages,
        { role: 'assistant', content: state.fullAnswer }
      ],
      fullAnswer: '',
      previousSentence: '',
      currentSentence: '',
      sentenceQueue: [],
      streamEndReceived: false
    }));
    return true;
  }
}));
```

---

## 四、核心组件设计

### 4.1 组件结构

```
App
├── StageLayout
│   ├── BackgroundLayer (Z-0)          # 氛围背景
│   ├── AvatarStage (Z-10)             # 数字人舞台
│   │   ├── Live2DViewer               # Live2D渲染
│   │   └── ThinkingVideo             # 思考态视频
│   ├── SubtitleDock (Z-20)           # 字幕区
│   │   ├── SentenceDisplay           # 上一句/当前句
│   │   └── AnswerExpand             # 回答展开卡片
│   ├── ControlDock (Z-20)            # 控制区
│   │   ├── HistoryButton            # 历史记录按钮
│   │   ├── MicButton               # 麦克风按钮（MVP仅UI）
│   │   └── EndTourButton           # 结束导览按钮
│   ├── ScrollPanel (Z-30)            # 右侧画轴
│   │   ├── KnowledgePanel          # 知识画轴
│   │   └── MapPanel               # 地图画轴
│   └── HistoryOverlay (Z-40)         # 历史记录覆盖层
│       └── HistoryChat             # 聊天记录面板
└── SatisfactionCard                   # 满意度评分
```

### 4.2 AvatarStage（数字人舞台）

**布局参数：**

| 状态 | left | scale | 说明 |
|------|------|-------|------|
| 默认 | 50% | 1 | 居中 |
| 画轴打开 | 30% | 0.93 | 左移缩小 |
| 地图画轴 | 28% | 0.92 | 更左更小 |

```jsx
function AvatarStage() {
  const { panelOpen, panelType, thinkingVideoVisible } = useAppStore();

  const stageClass = cn('avatar-stage', {
    'panel-open': panelOpen && panelType === 'knowledge',
    'map-open': panelOpen && panelType === 'map'
  });

  return (
    <div className={stageClass}>
      <Live2DViewer visible={!thinkingVideoVisible} />
      <ThinkingVideo visible={thinkingVideoVisible} />
    </div>
  );
}
```

```css
.avatar-stage {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 40vw;
  height: 70vh;
  transform: translate(-50%, -50%) scale(1);
  transition: left 600ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
}

.avatar-stage.panel-open {
  left: 30%;
  transform: translate(-50%, -50%) scale(0.93);
}

.avatar-stage.map-open {
  left: 28%;
  transform: translate(-50%, -50%) scale(0.92);
}
```

### 4.3 SubtitleDock（字幕组件）

**布局参数：**
- 宽度：屏幕宽度 52-64%
- 上一句字号：15-18px，颜色较淡
- 当前句字号：22-26px，颜色较亮
- 行距：1.5-1.7

```jsx
function SubtitleDock() {
  const { previousSentence, currentSentence, fullAnswer, answerExpanded } = useMessageStore();
  const { toggleAnswerExpand } = useAppStore();

  return (
    <div className="subtitle-dock">
      <div className="subtitle-previous">{previousSentence}</div>
      <div className="subtitle-current" onClick={toggleAnswerExpand}>
        {currentSentence}
      </div>
      {answerExpanded && (
        <AnswerExpand content={fullAnswer} onClose={toggleAnswerExpand} />
      )}
    </div>
  );
}
```

### 4.4 ControlDock（控制区）

**状态响应式强度：**

| 主状态 | 控制区强度 | 说明 |
|--------|-----------|------|
| LISTENING | 1.0 | 最强，麦克风放大5-10% |
| IDLE | 0.8 | 增强，轻微呼吸光晕 |
| THINKING | 0.5 | 适度弱化 |
| SPEAKING | 0.3 | 弱化，鼠标移入短暂增强 |

```jsx
function ControlDock() {
  const { mainState } = useAppStore();

  const intensityMap = {
    listening: 1,
    idle: 0.8,
    thinking: 0.5,
    speaking: 0.3
  };

  return (
    <div className="control-dock" style={{ opacity: intensityMap[mainState] || 0.5 }}>
      <HistoryButton />
      <MicButton state={mainState} />
      <EndTourButton />
    </div>
  );
}
```

### 4.5 ScrollPanel（画轴组件）

**知识画轴信息结构：**
```
┌─────────────────────────────┐
│         标题区               │
│    ┌─────────────────────┐  │
│    │   视觉展示区         │  │
│    │  (图片/3D模型/视频)  │  │
│    └─────────────────────┘  │
│         简短说明区           │
│     #关键词1 #关键词2       │
└─────────────────────────────┘
```

**地图画轴信息结构：**
```
┌─────────────────────────────┐
│      下一站：梵宫             │
│    ┌─────────────────────┐  │
│    │   地图主体区         │  │
│    │  (当前位置+下一站)   │  │
│    └─────────────────────┘  │
│   您现在位于灵山大佛脚下...   │
└─────────────────────────────┘
```

**动画：**
- 打开：从右侧滑入，500-800ms
- 关闭：向右滑出，500-800ms
- 数字人同步左移缩小

### 4.6 HistoryOverlay（历史记录）

**布局：**
- 全屏毛玻璃遮罩
- 面板宽度：屏幕 48-60%
- 面板高度：屏幕 68-78%
- 右上角返回按钮

**交互规则：**
- 打开时语音不暂停、音量不降低
- 关闭时恢复当前实时导览状态
- 新内容可继续追加

---

## 五、Live2D 技术方案

### 5.1 技术栈

| 库 | 用途 |
|---|---|
| pixi.js | 2D渲染引擎 |
| pixi-live2d-display | Live2D Cubism PixiJS插件 |

### 5.2 模型资源

```
miara_en/runtime/
├── miara_pro_t03.model3.json    ← 主模型配置
├── miara_pro_t03.moc3           ← 模型二进制
├── miara_pro_t03.physics3.json  ← 物理模拟
├── miara_pro_t03.cdi3.json      ← 显示信息
├── miara_pro_t03.4096/
│   └── texture_00.png           ← 纹理
└── motion/
    ├── Scene1.motion3.json      ← Idle动作
    ├── Scene2.motion3.json      ← Tap动作
    └── Scene3.motion3.json      ← Flic动作
```

### 5.3 LipSync 方案

```javascript
function updateLipSync(audioAnalyser, model) {
  const dataArray = new Uint8Array(audioAnalyser.frequencyBinCount);
  audioAnalyser.getByteFrequencyData(dataArray);

  // 计算音量（取低频段平均）
  const volume = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10 / 255;

  // 映射到嘴型参数 0-1
  model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', volume);
}
```

### 5.4 Live2DViewer 组件

```jsx
function Live2DViewer({ visible, isSpeaking }) {
  const canvasRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({
      view: canvasRef.current,
      width: 800,
      height: 900,
      transparent: true,
      backgroundAlpha: 0
    });

    const loadModel = async () => {
      const model = await Live2DModel.from('/models/miara_pro_t03.model3.json');
      model.anchor.set(0.5, 0.5);
      model.scale.set(0.3);
      app.stage.addChild(model);
      modelRef.current = model;
    };

    loadModel();
    return () => app.destroy();
  }, []);

  useEffect(() => {
    if (!modelRef.current) return;
    if (isSpeaking) {
      modelRef.current.motion('Flic');
    } else {
      modelRef.current.motion('Idle');
    }
  }, [isSpeaking]);

  return <canvas ref={canvasRef} className={cn('live2d-canvas', { visible })} />;
}
```

---

## 六、消息处理流程

### 6.1 WebSocket Hook

```javascript
function useWebSocket() {
  const { startThinking, mainState, currentResponseId, lastCompletedResponseId } = useAppStore();
  const { addToken, enqueueSentence } = useMessageStore();
  const { handleAudioStart, handleBinaryChunk, handleAudioEnd } = useAudioStore();

  const handleMessage = useCallback((data) => {
    // 校验responseId
    if (data.responseId && data.responseId !== currentResponseId) {
      // satisfaction_request使用lastCompletedResponseId
      if (data.type === 'satisfaction_request') {
        if (data.responseId !== lastCompletedResponseId) return;
      } else {
        return; // 丢弃旧消息
      }
    }

    switch (data.type) {
      case 'stream_start':
        break; // 仅标记，不切换状态

      case 'token':
        addToken(data.content);
        break;

      case 'sentence':
        enqueueSentence({
          content: data.content,
          segmentId: data.segmentId,
          emotion: data.emotion,
          responseId: data.responseId
        });
        break;

      case 'audio_start':
        handleAudioStart(data.segmentId, data.sampleRate, data.channels);
        break;

      case 'audio_end':
        handleAudioEnd(data.segmentId);
        break;

      case 'panel_open':
        openPanel(data.segmentId, data.panelType, data.payload);
        break;

      case 'panel_close':
        if (data.responseId === currentResponseId) {
          closePanel(false);
        }
        break;

      case 'satisfaction_request':
        showSatisfaction(data);
        break;
    }
  }, [currentResponseId, lastCompletedResponseId]);

  const sendQuestion = useCallback((content) => {
    // MVP阶段：禁止在Speaking/Thinking中发起新问题
    if (mainState === 'speaking' || mainState === 'thinking') return;

    const responseId = generateResponseId();
    setCurrentResponseId(responseId);
    startThinking(); // 立即触发Thinking

    wsClient.send({ type: 'question', responseId, content });
    addMessage({ role: 'user', content, responseId });
  }, [mainState]);

  return { sendQuestion };
}
```

### 6.2 音频播放器 Hook

```javascript
function useAudioPlayer() {
  const { segmentQueues, segmentStatus, handlePlaybackStart, handlePlaybackEnd } = useAudioStore();
  const { dequeueSentence } = useMessageStore();
  const { closePanel, panelSegmentId } = useAppStore();

  useEffect(() => {
    Object.entries(segmentStatus).forEach(([segmentId, status]) => {
      if (status === 'ready' && !isPlayingOther(segmentId)) {
        startPlayback(segmentId);
      }
    });
  }, [segmentStatus]);

  const startPlayback = async (segmentId) => {
    // 1. 更新字幕
    dequeueSentence(segmentId);

    // 2. 标记播放开始（首次触发SPEAKING）
    handlePlaybackStart(segmentId);

    // 3. 播放音频chunks（MVP阶段按segment收完再播）
    const chunks = segmentQueues[segmentId];
    for (const chunk of chunks) {
      await playChunk(chunk);
    }

    // 4. 播放结束（playback_end）
    handlePlaybackEnd(segmentId);

    // 5. 画轴自动关闭绑定playback_end
    if (panelSegmentId === segmentId) {
      closePanel(false);
    }

    // 6. 检查是否所有segment都播放完毕
    if (allSegmentsDone()) {
      finishResponse();
      clearResponse();
      transitionTo('idle');
    }
  };
}
```

---

## 七、开发计划

### 7.1 MVP版（10天）

| 天数 | 内容 | 交付物 |
|------|------|--------|
| D1 | 项目初始化、Zustand stores、WebSocket连接 | 基础框架 |
| D2 | 消息处理、responseId机制、状态机 | 消息收发正常 |
| D3 | Live2D渲染、基础LipSync | 数字人可显示 |
| D4 | AvatarStage布局、平移动效 | 居中+左移动效 |
| D5 | SubtitleDock双句字幕 | 字幕显示正常 |
| D6 | ControlDock基础实现 | 控制区状态响应 |
| D7 | Thinking视频、立即触发机制 | Thinking正常 |
| D8 | ScrollPanel知识画轴 | 画轴打开关闭 |
| D9 | 音频播放、segment机制、字幕同步 | 音频播放正常 |
| D10 | 联调、Bug修复 | 可演示Demo |

**MVP版范围：**
- ✅ Live2D + LipSync
- ✅ 居中 + 左移动效（绝对坐标）
- ✅ 双句字幕（音频驱动）
- ✅ 控制区（状态响应式）
- ✅ Thinking立即触发
- ✅ 知识画轴（结构化消息）
- ✅ 画轴自动关闭（playback_end）
- ✅ responseId防污染
- ✅ 手动关闭同段不重复
- ❌ 地图画轴（稳定版）
- ❌ 3D模型（稳定版）
- ❌ 满意度（稳定版）
- ❌ 语音输入（稳定版）

### 7.2 稳定版（+7天）

| 天数 | 内容 |
|------|------|
| D11 | 地图画轴组件 |
| D12 | 3D模型展示（占位） |
| D13 | 满意度UI |
| D14 | LipSync优化、情绪映射 |
| D15 | 动效打磨 |
| D16 | 错误处理、重连 |
| D17 | 全面测试 |

---

## 八、联调边界规则

### 8.1 状态触发规则

**规则1：SPEAKING 由首段音频开始播放触发，不由 stream_start 触发**

```
stream_start 到达 → 仅标记后端开始响应，主状态保持 THINKING
首个 segment 收完 → 准备播放
首个 segment 的第一个 PCM16 chunk 开始播放 → 主状态切换为 SPEAKING
```

**规则2：audio_end 只表示后端发送完成，playback_end 才表示前端播放完成**

```
audio_end (后端→前端): 标记该 segment 的 binary 已全部发送
playback_end (前端内部): 标记该 segment 的音频已全部播放完毕
两者可能有时间差（buffer中的数据还未播完）
```

**规则3：MVP 阶段音频段必须串行发送，不支持多个 segment 交错传输**

```
MVP阶段约束：
  后端必须保证 segment 串行发送
  即：seg_001 的 audio_start → binary × N → audio_end
  然后才能发送 seg_002 的 audio_start
  前端不处理多 segment 交错情况

稳定版优化：
  支持多 segment 交错传输
  前端按 activeSegmentId 分组归属
```

**规则4：MVP 阶段表述统一为"segment 收完后再播，真正开始播放首个 chunk 时才进入 SPEAKING"**

```
MVP阶段音频播放流程：
  1. 收到 audio_start → 标记 activeSegmentId
  2. 收到 binary × N → 加入该 segment 的队列
  3. 收到 audio_end → 标记该 segment 为 ready
  4. 检查是否可以开始播放（串行，前一个 segment 播完）
  5. 开始播放该 segment 的第一个 chunk → 主状态切换为 SPEAKING
  6. 播放完所有 chunk → playback_end
```

### 8.2 画轴关闭规则

**规则5：画轴自动关闭绑定 playback_end**

```
当某 segment 的 playback_end 触发时：
  如果 panelSegmentId === segmentId → 自动关闭画轴
  不是 audio_end，是 playback_end
```

**规则6：panel_close 必须校验 responseId + segmentId**

```
收到后端 panel_close 消息时：
  校验 responseId === currentResponseId
  校验 segmentId === panelSegmentId
  两个都匹配才执行关闭
  防止旧消息误关闭当前画轴
```

**规则7：manuallyClosedSegmentIds 使用 responseId:segmentId 作为 key**

```
key 格式: responseId:segmentId
示例: resp_20260610_001:seg_001
好处: 防止不同 response 的同名 segmentId 冲突
清理时机: response 生命周期结束后统一清理
```

### 8.3 满意度规则

**规则8：satisfaction_request 使用 lastCompletedResponseId，避免被过滤**

```javascript
// 消息过滤逻辑
if (data.type === 'satisfaction_request') {
  if (data.responseId !== currentResponseId &&
      data.responseId !== lastCompletedResponseId) {
    return; // 丢弃
  }
} else {
  if (data.responseId !== currentResponseId) {
    return; // 丢弃
  }
}
```

### 8.4 MVP阶段限制

**规则9：MVP 阶段禁止在 Speaking / Thinking 中发起新问题**

```javascript
const sendQuestion = (content) => {
  if (mainState === 'speaking' || mainState === 'thinking') {
    return; // MVP阶段直接返回，稳定版可考虑打断机制
  }
  // ... 发送问题
};
```

**规则10：MVP 阶段音频段必须串行，segment 收完后再播**

```
MVP阶段约束：
  1. 后端必须串行发送 segment，不支持交错
  2. 前端 segment 收完后再播放
  3. 真正开始播放首个 chunk 时才进入 SPEAKING

稳定版优化：
  1. 支持多 segment 交错传输
  2. 边收边播（Web Audio API buffer queue）
```

### 8.5 超时兜底规则

**规则11：WebSocket / 音频 / Thinking 必须有超时兜底**

```javascript
const TIMEOUT = {
  wsConnect: 10000,        // WebSocket连接超时 10s
  wsMessage: 60000,        // 消息间隔超时 60s
  wsHeartbeat: 35000,      // 心跳间隔 35s
  thinking: 15000,         // Thinking超时 15s（显示提示）
  thinkingForce: 30000,    // Thinking强制结束 30s
  audioSegmentGap: 10000,  // 音频段间隔 10s
  audioTotal: 120000       // 单轮最大播放 120s
};

// Thinking超时处理
function handleThinkingTimeout() {
  // 15s无响应：显示"正在加载中..."
  // 30s后自动结束，返回IDLE
}

// 音频超时处理
function handleAudioTimeout() {
  // 超过预期时长：强制结束当前segment
  // 继续播放下一个segment或返回IDLE
}

// WebSocket超时处理
function handleWebSocketTimeout() {
  // 断开后自动重连（最多5次）
  // 重连失败显示错误提示
}
```

### 8.6 联调检查清单

| 检查项 | 预期行为 | 异常处理 |
|--------|----------|----------|
| stream_start | 不触发SPEAKING，仅标记streamEndReceived=false | 仅标记 |
| 首个audio chunk | 触发SPEAKING + 关闭Thinking | 状态机转换 |
| sentence到达 | 进入队列，不更新字幕 | 等待音频 |
| audio_start | 标记activeSegmentId | 初始化队列 |
| binary到达 | 归属到activeSegmentId | 无segmentId则丢弃 |
| audio_end | 标记后端发送完毕 | 等待playback_end |
| playback_end | 更新字幕 + 关闭画轴 | 检查所有segment |
| stream_end | 标记streamEndReceived=true | 检查是否可finishResponse |
| finishResponse | 必须同时满足stream_end和所有playback_end | 不满足则等待 |
| segment串行 | MVP阶段不支持交错传输 | 后端必须串行 |
| panel_close | 校验responseId+segmentId | 不匹配则忽略 |
| manuallyClosedKey | 使用responseId:segmentId格式 | 防止冲突 |
| satisfaction_request | 使用lastCompletedResponseId | 避免被过滤 |
| Speaking中提问 | MVP拒绝 | 稳定版可打断 |
| Thinking超时 | 15s显示提示 | 30s自动结束 |
| WebSocket断开 | 自动重连 | 5次失败报错 |

---

## 九、目录结构

```
frontend/src/
├── index.js
├── index.css
├── App.js
│
├── stores/
│   ├── appStore.js           # 主状态机 + 叠加状态
│   ├── messageStore.js       # 消息历史 + 字幕状态
│   └── audioStore.js         # 音频播放状态
│
├── hooks/
│   ├── useWebSocket.js       # WebSocket连接
│   ├── useAudioPlayer.js     # 音频播放 + LipSync数据
│   └── useLive2D.js          # Live2D模型管理
│
├── components/
│   ├── StageLayout.js        # 舞台布局容器
│   ├── avatar/
│   │   ├── AvatarStage.js    # 数字人舞台
│   │   ├── Live2DViewer.js   # Live2D渲染
│   │   └── ThinkingVideo.js  # 思考态视频
│   ├── subtitle/
│   │   ├── SubtitleDock.js   # 字幕容器
│   │   └── AnswerExpand.js   # 回答展开卡片
│   ├── control/
│   │   ├── ControlDock.js    # 控制区容器
│   │   └── MicButton.js      # 麦克风按钮（MVP仅UI）
│   ├── panel/
│   │   ├── ScrollPanel.js    # 画轴容器
│   │   ├── KnowledgePanel.js # 知识画轴
│   │   └── MapPanel.js       # 地图画轴
│   ├── history/
│   │   ├── HistoryOverlay.js # 历史记录遮罩
│   │   └── HistoryChat.js    # 聊天记录面板
│   └── satisfaction/
│       └── SatisfactionCard.js
│
├── utils/
│   ├── websocket.js          # WebSocket客户端类
│   ├── audioPlayer.js        # 音频播放器类
│   └── stateMachine.js       # 状态机定义
│
└── styles/
    ├── variables.css
    ├── animations.css
    ├── avatar.module.css
    ├── subtitle.module.css
    ├── control.module.css
    ├── panel.module.css
    └── history.module.css
```
