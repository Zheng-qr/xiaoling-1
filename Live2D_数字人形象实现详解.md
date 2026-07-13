# Live2D 数字人形象实现详解

---

## 一、技术选型

| 技术 | 作用 |
|------|------|
| **PIXI.js** | 2D 渲染引擎，承载 Live2D 模型的绘制 |
| **pixi-live2d-display** | PIXI 与 Live2D Cubism 4 的桥接库 |
| **Live2D Cubism 4** | 数字人模型格式（.moc3） |

---

## 二、模型结构

模型文件位于 `frontend/public/models/miara/`：

```
miara/
├── miara_pro_t03.moc3              # 核心模型数据（二进制）
├── miara_pro_t03.4096/
│   └── texture_00.png               # 贴图（4096x4096）
├── miara_pro_t03.physics3.json     # 物理运算配置（头发/衣服摆动）
├── miara_pro_t03.cdi3.json         # 显示信息
└── motion/
    ├── Scene1.motion3.json         # Idle 待机动画（2.6秒，循环）
    ├── Scene2.motion3.json         # Tap 点击动画
    └── Scene3.motion3.json         # Flic 说话动画
```

---

## 三、核心实现流程

### 1. 初始化渲染

代码位置：`frontend/src/hooks/useLive2D.js`

```javascript
// 创建 PIXI 应用，透明背景
const app = new PIXI.Application({
  view: canvasRef.current,
  width: 800,
  height: 900,
  transparent: true,
  backgroundAlpha: 0,
  antialias: true,
});

// 加载 Live2D 模型
const model = await Live2DModel.from(MODEL_URL);

// 居中 + 缩放
model.anchor.set(0.5, 0.5);
model.scale.set(0.35);   // 缩放到 35%
model.x = 400;
model.y = 550;
```

### 2. 动作系统（Motions）

模型预置了 3 个动作，通过 `model.motion('名称')` 调用：

| 动作 | 触发时机 | 文件 |
|------|---------|------|
| `Idle` | 待机/思考状态 | Scene1.motion3.json（循环，2.6秒） |
| `Tap` | 用户点击模型 | Scene2.motion3.json |
| `Flic` | 说话中 | Scene3.motion3.json |

### 3. 嘴型同步（LipSync）

通过 `requestAnimationFrame` 每帧读取音频分析数据：

```javascript
const tick = () => {
  const analyser = useAudioStore.getState().analyserNode;
  if (model && analyser) {
    // 采集频率数据
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    // 取低频段(0-10)平均值作为音量 (0~1)
    const volume = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255;
    
    // 映射到 Live2D 嘴型参数
    model.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', volume);
  }
  requestAnimationFrame(tick);
};
```

**原理**：音频播放时，`AnalyserNode` 实时采集低频音量，映射到 `ParamMouthOpenY`（嘴巴张开程度），实现说话时的嘴型动画。

---

## 四、Canvas 渲染层

代码位置：`frontend/src/components/avatar/AvatarStage.js`

```jsx
<div className="avatar-stage">
  <canvas ref={canvasRef} className="avatar-canvas" />
  {thinkingVideoVisible && (
    <div className="thinking-overlay">思考中...</div>
  )}
</div>
```

CSS 样式控制位置和动效：
- 正常：居中显示
- 画轴打开时：`left: 30%` + `scale(0.93)` 左移缩小
- 背景：深色渐变 + 粒子光效

---

## 五、状态联动

通过 Zustand 的 `appStore` 监听 `mainState` 变化，自动切换动作：

```javascript
useAppStore.subscribe((state, prev) => {
  if (state.mainState !== prev.mainState) {
    switch (state.mainState) {
      case 'idle':    model.motion('Idle');   break;
      case 'speaking': model.motion('Flic');  break;
      case 'thinking': model.motion('Idle');  break;
    }
  }
});
```

状态流转：`idle` → `thinking` → `speaking` → `idle`

---

## 六、模型配置（model3.json）

```json
{
  "FileReferences": {
    "Moc": "miara_pro_t03.moc3",
    "Textures": ["miara_pro_t03.4096/texture_00.png"],
    "Physics": "miara_pro_t03.physics3.json",
    "Motions": {
      "Idle": [{ "File": "motion/Scene1.motion3.json" }],
      "Tap":  [{ "File": "motion/Scene2.motion3.json" }],
      "Flic": [{ "File": "motion/Scene3.motion3.json" }]
    }
  },
  "Groups": [
    { "Target": "Parameter", "Name": "LipSync", "Ids": [] },
    { "Target": "Parameter", "Name": "EyeBlink", "Ids": [] }
  ]
}
```

- `LipSync` 组：预留的唇形同步参数（代码中直接操作 `ParamMouthOpenY`）
- `EyeBlink` 组：眨眼参数（模型内置自动眨眼）

---

## 七、整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 React                            │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  AvatarStage │    │  useLive2D   │    │   PIXI.js    │  │
│  │  (Canvas)    │◄───│  (Hook)      │◄───│  Application │  │
│  └──────────────┘    └──────┬───────┘    └──────────────┘  │
│                              │                               │
│                     ┌────────▼────────┐                      │
│                     │  Live2DModel    │                      │
│                     │  (.moc3)        │                      │
│                     └─────────────────┘                      │
│                              ▲                               │
│                     音频数据流                                │
│  ┌──────────────┐    ┌──────────────┐                       │
│  │  AudioContext│───►│ AnalyserNode │  (LipSync)          │
│  │  (播放音频)   │    └──────┬───────┘                       │
│  └──────────────┘           │                               │
│                     requestAnimationFrame                     │
│                     每帧读取音量 → ParamMouthOpenY           │
└─────────────────────────────────────────────────────────────┘
```

---

## 八、关键文件清单

| 文件路径 | 说明 |
|---------|------|
| `frontend/src/hooks/useLive2D.js` | Live2D 核心 Hook，负责模型加载、渲染、LipSync、Motion 切换 |
| `frontend/src/components/avatar/AvatarStage.js` | Canvas 容器组件 |
| `frontend/src/stores/appStore.js` | 状态管理，存储 `mainState` |
| `frontend/src/stores/audioStore.js` | 音频状态管理，存储 `analyserNode` |
| `frontend/src/vendor/live2d-cubism4.js` | pixi-live2d-display 封装库 |
| `frontend/public/models/miara/miara_pro_t03.model3.json` | 模型配置文件 |
| `frontend/public/models/miara/miara_pro_t03.moc3` | 模型二进制数据 |
| `frontend/public/models/miara/motion/*.motion3.json` | 动作文件 |
