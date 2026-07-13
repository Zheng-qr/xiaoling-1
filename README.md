# 小灵景区导览数字人项目

这个仓库用于存放完整项目。当前已经整理并上传的是新版前端，统一放在 `frontend_new/` 目录下，避免后续真实后端、算法服务、部署脚本等内容与前端文件混在仓库根目录。

## 当前目录

- `frontend_new/`：景区导览数字人新版 C 端前端，包含 React 前端、Live2D 资源、移动端布局、模拟后端和开发文档。

## 前端启动

```powershell
cd frontend_new
npm.cmd install
npm.cmd run dev -- --host 0.0.0.0
```

更完整的功能说明见 `frontend_new/docs/frontend-function-spec.md`。
