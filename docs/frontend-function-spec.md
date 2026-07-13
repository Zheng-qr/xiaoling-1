# frontend_new 功能说明文档

本文档说明 `frontend_new` 当前已经实现的前端能力、运行方式、核心文件结构和后端对接点。本文档描述的是当前代码已经具备的功能，不包含尚未完成的计划项。

## 1. 项目定位

`frontend_new` 是景区导览数字人的新版 C 端前端，技术栈为 React 18、Vite、Zustand、PixiJS 和 `pixi-live2d-display`。它的目标是提供一个可演示的景区数字人导览界面，覆盖桌面端大屏展示和手机端基础展示。

当前前端支持三类使用场景：

1. 桌面端主对话模式：数字人居中展示，回答字幕、输入栏、历史记录、知识卡片和地图卡片协同展示。
2. 桌面端路线导览模式：左侧数字人和景点列表，右侧路线地图和路线摘要。
3. 手机端移动布局：上半屏数字人，中下部字幕/回答区，底部固定输入栏，重点保证数字人和基本问答控件可用。

## 2. 运行方式

### 2.1 前端

在 `frontend_new` 根目录运行：

```powershell
npm.cmd install
npm.cmd run dev -- --host 0.0.0.0
```

默认访问地址：

```text
http://localhost:5173
```

手机真机访问时，使用电脑局域网 IP：

```text
http://电脑IP:5173
```

### 2.2 前端旁路模拟服务

`frontend_new/backend` 是 Node + Express 的模拟接口服务，主要提供景点、路线和图片资源的本地回环数据，端口为 `3001`。

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

健康检查：

```text
http://localhost:3001/api/health
```

### 2.3 真实数字人 WebSocket 后端

当前 `src/hooks/useWebSocket.js` 中 WebSocket 地址写死为：

```text
ws://localhost:8000/ws/digital_human_client
```

桌面本机联调可以直接使用。手机真机联调时，`localhost` 会指向手机自身，因此需要后续改成可配置的 `VITE_WS_URL` 或手动改成电脑 IP。

## 3. 移动端判定

移动端入口在 `src/hooks/useIsMobile.js`。

当前规则：

```text
window.innerWidth <= 768
```

满足该条件时，`src/App.jsx` 会渲染 `MobileStageLayout`；否则桌面端继续根据路线状态渲染 `StageLayout` 或 `RouteGuideLayout`。

建议测试尺寸：

- `375 x 667`
- `390 x 844`
- `430 x 932`

## 4. 数字人功能

### 4.1 已接入模型

当前支持三个 Live2D 模型：

| 显示名称 | 内部 key | 模型路径 |
| --- | --- | --- |
| Miara | `miara` | `/models/miara_en/runtime/miara_pro_t03.model3.json` |
| Little Panda | `little_panda` | `/models/little_panda/little_panda.model3.json` |
| Xuancao | `xuancao` | `/models/xuancao/xuancao.model3.json` |

桌面端和移动端模型切换菜单都已显示这三个模型。

### 4.2 Live2D 渲染

核心渲染逻辑在 `src/hooks/useLive2D.js`。

已实现能力：

- 使用 PixiJS 创建透明 canvas。
- 使用 `pixi-live2d-display/cubism4` 加载 Cubism 4 模型。
- 根据模型类型设置独立缩放和垂直位置。
- 在手机窄屏下使用独立 `mobileScale` 和 `mobileY`，避免模型明显裁切。
- 模型切换时销毁旧 Pixi 应用并重新加载新模型。
- 手动调用 `model.update(deltaTime)`，保证 Live2D 动作持续更新。
- 避免模型切换时误停动画循环，保证切换到 Little Panda / Xuancao 后仍能动。

### 4.3 动作状态

前端主状态定义在 `src/stores/appStore.js`：

- `idle`
- `listening`
- `thinking`
- `speaking`
- `ending`

动作映射逻辑：

- `idle`：优先播放 `Idle`
- `listening`：优先播放 `Listening`，缺失时回退 `Idle`
- `thinking`：优先播放 `Thinking`，缺失时回退 `Idle`
- `speaking`：优先播放 `Speaking`，缺失时回退 `Flic`，再缺失回退 `Idle`

Little Panda 当前注册了：

- `Idle`
- `Thinking`
- `Listening`
- `Speaking`

Xuancao 当前注册了：

- `Idle`
- `Walk`
- `Speaking`

Miara 当前注册了：

- `Idle`
- `Tap`
- `Flic`

### 4.4 嘴型和水印处理

音频播放时，`useAudioPlayer` 会创建 `AnalyserNode`，`useLive2D` 根据音量写入 `ParamMouthOpenY`，用于嘴型同步。

Little Panda 的水印隐藏已恢复：

- 参数：`Param`
- 部件：`Part16`

隐藏逻辑在加载后执行一次，并在每帧更新时兜底执行，避免模型更新后水印重新出现。

## 5. 桌面端主对话模式

入口组件：`src/components/StageLayout.jsx`

已实现区域：

- 背景层
- 数字人舞台 `AvatarStage`
- 字幕区 `SubtitleDock`
- 右上控制面板 `ControlDock`
- 底部输入栏 `InputBar`
- 知识/地图画卷面板 `ScrollPanel`
- 历史记录弹层 `HistoryOverlay`
- 满意度卡片 `SatisfactionCard`
- 图片放大弹层 `ImageModal`

### 5.1 输入栏

桌面输入栏在 `src/components/control/InputBar.jsx`。

已实现：

- 文本输入
- 回车发送
- 语音输入按钮
- 历史按钮
- 发送按钮
- 忙碌状态下禁用输入和发送

语音输入使用浏览器原生 `SpeechRecognition` / `webkitSpeechRecognition`，语言设置为 `zh-CN`。如果浏览器不支持，会提示使用 Chrome 或 Edge。

### 5.2 预设控制

`ControlDock` 和 `PresetButtons` 提供景点知识问答、路线推荐等快捷入口。它们通过 `sendQuestion` 走同一套 WebSocket 提问逻辑。

### 5.3 字幕和回答

消息状态在 `src/stores/messageStore.js`。

已实现：

- token 累计为完整回答 `fullAnswer`
- 当前字幕 `currentSentence`
- 上一句字幕 `previousSentence`
- 句子队列 `sentenceQueue`
- 回答完成后写入历史消息

## 6. 手机端移动布局

入口组件：`src/components/mobile/MobileStageLayout.jsx`

布局结构：

- 上半屏：`MobileAvatarStage`，数字人 Live2D 居中展示
- 中下部：`MobileAnswerStream`，显示状态、字幕、累计回答、知识图片和路线地图
- 底部：`MobileInputBar`，固定输入栏，包含历史、输入、语音、发送

移动端使用：

- `height: 100dvh`
- `env(safe-area-inset-bottom)`
- 底部输入栏固定
- 回答区可滚动
- 不使用桌面端画卷偏移动画，数字人始终固定在上半屏

### 6.1 移动端知识和地图

移动端不弹出桌面画卷，而是在回答区域中内嵌：

- `MobileKnowledgeBlock`
- `MobileMapBlock`

有 payload 时显示图片、描述和路线地图；没有 payload 时不显示空卡片。图片点击复用 `ImageModal` 放大。

## 7. 路线导览模式

入口组件：`src/components/route/RouteGuideLayout.jsx`

状态管理在 `src/stores/routeStore.js`。

已实现：

- 路线模式开关 `isRouteMode`
- 路线 payload 保存
- 当前高亮景点 `activeSpotId`
- 下一景点/上一景点切换
- 左侧景点卡片列表
- 左侧路线模式数字人
- 右侧路线地图面板
- 返回主对话模式

WebSocket 收到 `route_guidance` 且存在 `payload` 时，会进入路线导览模式。

## 8. WebSocket 和后端消息

核心文件：

- `src/hooks/useWebSocket.js`
- `src/utils/websocket.js`

当前 WebSocket 地址：

```text
ws://localhost:8000/ws/digital_human_client
```

已处理消息类型：

- `connected`
- `stream_start`
- `intent`
- `token`
- `emotion`
- `sentence`
- `panel_open`
- `route_guidance`
- `binary`
- `stream_end`
- `satisfaction_request`
- `pong`
- `error`

前端发送：

- `question`
- `satisfaction`

注意：当前 `avatar_action` 的接口文档已经存在于 `docs/avatar-action-interface.md`，但最新 `useWebSocket.js` 还没有完整接入该类型。后续如果后端要直接控制数字人动作，可以按该文档接入。

## 9. 音频播放

核心文件：

- `src/hooks/useAudioPlayer.js`
- `src/stores/audioStore.js`

已实现：

- 接收后端 binary PCM16 音频
- PCM16 转 Float32
- 音频队列缓存
- 最小预缓冲 `minPrebuffer = 5`
- 使用 Web Audio API 播放
- 播放开始时切到 `speaking`
- 播放结束后回到 `idle`
- 使用 `AnalyserNode` 给 Live2D 嘴型提供音量数据

## 10. 历史、满意度和图片弹层

已实现：

- 历史记录开关：`historyOpen`
- 历史弹层：`HistoryOverlay`
- 历史聊天展示：`HistoryChat`
- 满意度请求：收到 `satisfaction_request` 后保存 pending 数据
- 满意度提交：通过 WebSocket 发送 `satisfaction`
- 图片放大：`ImageModal`

## 11. 静态资源

运行时主要依赖：

- `public/live2dcubismcore.min.js`
- `public/models/miara_en`
- `public/models/little_panda`
- `public/models/xuancao`
- `public/assets/map`
- `public/assets/photo`

根目录下曾存在的 `map/`、`photo/`、`miara_en/` 等重复资源已经清理；当前代码和模拟服务统一使用 `public/` 下的运行时资源。剩余资料类文件的上传取舍详见 `docs/file-cleanup-audit.md`。

## 12. 当前限制和建议后续项

当前限制：

- 手机真机访问真实后端时，WebSocket 地址仍需改成电脑 IP 或环境变量。
- `avatar_action` 文档已准备，但最新 WebSocket handler 未完整接入。
- 根目录原始素材包、备份和重复资源已清理；仍需确认 `Route Guide Frontend Specification.docx`、`word_content.txt`、`参考图片.png` 是否上传。
- 旧 README 和部分源码注释存在编码乱码，但运行逻辑不受影响。

建议后续项：

- 将 `WS_URL` 改为 `import.meta.env.VITE_WS_URL || 默认地址`。
- 增加 `.env.example`。
- 按需要决定是否上传剩余资料类文件。
- 在 GitHub 仓库中只提交源码、运行资源和文档，不提交 `node_modules`、`dist`、素材原包。
