# Markdown 预览工具

基于 Electron + React + Vite 的 Markdown 预览桌面应用。

## 核心模块

### 主进程 (src/main/)

| 模块 | 功能 |
|------|------|
| index.ts | 应用入口，处理启动参数和文件关联 |
| WindowManager.ts | 窗口创建和安全配置 |
| MenuManager.ts | 应用菜单（文件→打开文件 Ctrl+O） |
| FileHandler.ts | 文件对话框和读取 |
| FileWatcher.ts | 多文件变化监视（chokidar） |
| IPCHandler.ts | 进程间通信 |

### 预加载脚本 (src/preload/)

| API | 功能 |
|-----|------|
| openFile() | 打开文件对话框 |
| readFile(path) | 读取文件内容 |
| closeFile(path) | 关闭文件监视 |
| onFileChanged(cb) | 监听文件变化 |
| onFileError(cb) | 监听错误 |

### 渲染进程 (src/renderer/)

| 模块 | 功能 |
|------|------|
| App.tsx | 多标签状态管理 |
| TabBar.tsx | 标签栏（切换、关闭、拖拽排序） |
| Toolbar.tsx | 顶部工具栏 |
| PreviewPane.tsx | Markdown 预览区域 |
| MarkdownRenderer.ts | Markdown 渲染（marked + highlight.js + DOMPurify） |
| ErrorToast.tsx | 错误提示 |

## 开发命令

```bash
# 开发模式
yarn dev

# 完整构建
yarn build

# 打包应用
yarn build:win     # Windows
yarn build:mac     # macOS
yarn build:linux   # Linux
```

## 构建产物

| 目录 | 内容 |
|------|------|
| dist/ | 渲染进程（HTML, CSS, JS） |
| dist-electron/ | 主进程（main.cjs, preload.cjs） |
| release/ | 打包的可执行文件 |

## 技术栈

- Electron 25 - 桌面应用框架
- React 18 - UI 框架
- TypeScript - 类型安全
- Vite - 构建工具
- marked - Markdown 解析
- highlight.js - 代码高亮
- DOMPurify - XSS 防护
- chokidar - 文件监视

## 开源协议

MIT License
