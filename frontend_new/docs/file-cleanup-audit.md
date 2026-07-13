# frontend_new 文件清理记录

本文档记录 `frontend_new` 当前的文件清理状态、已删除内容、保留内容，以及最终上传到 GitHub 的目录组织方式。

## 1. 清理目标

本次整理的目标是把 `frontend_new` 收敛为一个可以上传到 GitHub 的全新前端项目：

- 保留前端源码、运行所需静态资源和模拟后端。
- 保留开发说明文档。
- 删除根目录原始素材包、重复资源、时间戳备份和空目录。
- 不上传依赖目录、构建产物和本地临时文件。

## 2. 已保留的核心内容

这些内容是项目运行或说明所需，当前应保留并上传：

- `src/`
- `public/`
- `backend/server.js`
- `backend/package.json`
- `backend/package-lock.json`
- `index.html`
- `package.json`
- `package-lock.json`
- `vite.config.js`
- `README.md`
- `docs/`
- `Live2D_数字人形象实现详解.md`
- `开发计划文档.md`
- `景区导览数字人C端前端开发方案v1.0.md`

其中 `public/` 内保留了运行时真正使用的资源：

- `public/live2dcubismcore.min.js`
- `public/models/miara_en/`
- `public/models/little_panda/`
- `public/models/xuancao/`
- `public/assets/map/`
- `public/assets/photo/`

## 3. 已删除的内容

以下内容已根据确认范围清理：

- `古装萝莉提灯/`
- `虚拟皮套39/`
- `miara_en/`
- `map/`
- `photo/`
- `backups/`
- `src/components/avatar/AvatarStage_20260711_082738.jsx`
- `src/components/avatar/Live2DViewer_20260711_082738.jsx`
- `src/components/route/RouteAvatarStage_20260711_082739.jsx`
- `src/hooks/useLive2D_20260711_082739.js`
- `src/hooks/useWebSocket_20260711_082739.js`
- `src/stores/appStore_20260711_082739.js`
- `src/utils/websocket_20260711_082745.js`
- `public/models/little_panda/expression1.exp3_20260711_082732.json`
- `public/models/little_panda/little_panda.cdi3_20260711_083048.json`
- `public/models/little_panda/little_panda.model3_20260711_083048.json`
- `public/models/miara_en/runtime/miara_pro_t03(1).moc3`
- `public/models/miara_en/runtime/miara_pro_t03.cdi3(1).json`
- `public/models/miara_en/runtime/miara_pro_t03.model3(1).json`
- `public/models/miara_en/runtime/miara_pro_t03.model3_20260711_082732.json`
- `public/models/miara_en/runtime/miara_pro_t03.physics3(1).json`
- `public/models/miara_en/runtime/miara_pro_t03.4096/texture_00(1).png`
- `public/models/miara_en/runtime/motion/Scene1.motion3(1).json`
- `public/models/miara_en/runtime/motion/Scene2.motion3(1).json`
- `public/models/miara_en/runtime/motion/Scene3.motion3(1).json`

同时已清理空目录：

- `.agents/`
- `.agents_20260711_081712/`
- `.codex/`
- `.git/`
- `.git_20260711_081712/`
- `新建文件夹/`
- `新建文件夹_20260711_082844/`
- `public/videos/`
- `public/videos_20260711_082727/`
- `src/data/`

## 4. 保留但不上传的本地内容

以下内容仍可留在本地，方便开发和验证，但已经通过 `.gitignore` 排除，不应上传：

- `node_modules/`
- `backend/node_modules/`
- `dist/`

说明：

- `node_modules/` 可通过 `npm.cmd install` 重建。
- `backend/node_modules/` 可在 `backend/` 内通过 `npm.cmd install` 重建。
- `dist/` 可通过 `npm.cmd run build` 重建。

## 5. 已随前端归档上传的资料文件

以下文件不是运行必需，但已根据确认一并放入 `frontend_new/` 并上传，方便保留完整设计和过程资料：

- `Route Guide Frontend Specification.docx`
- `word_content.txt`
- `参考图片.png`

说明：

- 这三个文件位于仓库的 `frontend_new/` 目录中，不散落在仓库根目录。
- 后续如果项目仓库需要进一步规范文档结构，可以再把 `Route Guide Frontend Specification.docx` 移入 `frontend_new/docs/`。

## 6. 当前 GitHub 目录结构

仓库根目录只保留完整项目级别的文件和目录。当前前端统一放在：

```text
frontend_new/
```

`frontend_new/` 内部包含：

```text
src/
public/
backend/
docs/
README.md
index.html
package.json
package-lock.json
vite.config.js
Live2D_数字人形象实现详解.md
开发计划文档.md
景区导览数字人C端前端开发方案v1.0.md
Route Guide Frontend Specification.docx
word_content.txt
参考图片.png
```

根目录 `.gitignore` 继续排除以下可重建或本地临时内容：

```text
node_modules/
backend/node_modules/
dist/
.vite/
```
