# 灵山景区导览数字人新版前端

这是景区导览数字人的新版 C 端前端，基于 React 18、Vite、Zustand、PixiJS 和 Live2D 实现。

## 已实现能力

- 桌面端主对话布局
- 手机端独立布局，`window.innerWidth <= 768` 时自动启用
- 三个 Live2D 模型切换：`Miara`、`Little Panda`、`Xuancao`
- Live2D 待机、思考、聆听、说话动作映射和兜底动画
- Little Panda 水印隐藏
- 文本输入、语音输入、发送、历史记录
- WebSocket 问答流接入
- PCM16 流式音频播放和嘴型驱动
- 字幕、累计回答、知识卡片、地图/路线内容展示
- 桌面端路线导览模式
- 移动端知识图片和地图内嵌展示
- 图片放大弹层、满意度卡片

## 快速启动

```powershell
npm.cmd install
npm.cmd run dev -- --host 0.0.0.0
```

访问：

```text
http://localhost:5173
```

手机真机访问时，将 `localhost` 换成电脑局域网 IP：

```text
http://电脑IP:5173
```

## 构建

```powershell
npm.cmd run build
```

## 后端说明

当前前端 WebSocket 地址在 `src/hooks/useWebSocket.js`：

```text
ws://localhost:8000/ws/digital_human_client
```

`frontend_new/backend` 是一个 Node + Express 的本地模拟服务，端口 `3001`，用于景点、路线和静态资源回环测试；它不是完整真实数字人后端。

## 文档

- [功能说明文档](docs/frontend-function-spec.md)
- [文件清理审计](docs/file-cleanup-audit.md)
- [数字人动作接口说明](docs/avatar-action-interface.md)

## 上传 GitHub 前的建议

不要上传 `node_modules/`、`dist/`、素材原包、备份目录和重复资源。具体清单见：

```text
docs/file-cleanup-audit.md
```
