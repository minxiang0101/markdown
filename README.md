# Markdown 预览工具 - 运行逻辑说明

## 项目架构

这是一个基于 Electron + React + Vite 的桌面应用，采用标准的 Electron 三进程架构：

```
┌─────────────────────────────────────────────────────────────┐
│                      主进程 (Main Process)                   │
│  - 管理应用生命周期                                           │
│  - 创建和管理窗口                                             │
│  - 处理文件系统操作                                           │
│  - 监听文件变化                                               │
└─────────────────────────────────────────────────────────────┘
                            ↕ IPC 通信
┌─────────────────────────────────────────────────────────────┐
│                    预加载脚本 (Preload)                       │
│  - 安全地暴露 API 给渲染进程                                  │
│  - 验证和过滤参数                                             │
└─────────────────────────────────────────────────────────────┘
                            ↕ Context Bridge
┌─────────────────────────────────────────────────────────────┐
│                   渲染进程 (Renderer Process)                 │
│  - React 应用界面                                             │
│  - Markdown 渲染                                              │
│  - 用户交互处理                                               │
└─────────────────────────────────────────────────────────────┘
```

## 核心模块

### 主进程 (src/main/)

#### 1. index.ts - 应用入口
- 初始化窗口管理器、IPC 处理器、菜单管理器
- 监听应用生命周期事件
- 处理窗口关闭和应用退出

#### 2. WindowManager.ts - 窗口管理
- 创建主窗口（1200x800，最小 800x600）
- 配置安全策略（禁用 Node 集成、启用上下文隔离、沙箱模式）
- 设置 Content Security Policy (CSP)
- 加载应用内容（开发环境加载 Vite 服务器，生产环境加载构建文件）

#### 3. MenuManager.ts - 菜单管理
- 创建中文应用菜单
- 包含：文件、编辑、视图、窗口、帮助菜单
- 支持 macOS 和 Windows 平台差异

#### 4. FileHandler.ts - 文件操作
- 打开文件对话框（只允许 .md 和 .markdown 文件）
- 读取文件内容
- 验证文件类型和路径安全性
- 错误处理和分类（文件不存在、权限拒绝、读取失败等）

#### 5. FileWatcher.ts - 文件监视
- 使用 chokidar 监视文件变化
- 防抖处理（300ms）避免频繁更新
- 监听文件修改、删除事件
- 错误容错处理

#### 6. IPCHandler.ts - 进程间通信
- 注册 IPC 处理器：
  - `open-file`: 打开文件对话框
  - `read-file`: 读取文件内容
- 发送事件到渲染进程：
  - `file-changed`: 文件内容更新
  - `file-error`: 文件错误
- 管理文件监视器生命周期

### 预加载脚本 (src/preload/)

#### index.ts - 安全桥接
- 通过 contextBridge 暴露安全 API
- 提供的 API：
  - `openFile()`: 打开文件对话框
  - `readFile(filePath)`: 读取文件
  - `onFileChanged(callback)`: 监听文件变化
  - `onFileError(callback)`: 监听错误
- 参数验证和安全检查（防止路径遍历攻击）

### 渲染进程 (src/renderer/)

#### 1. App.tsx - 应用根组件
- 管理应用状态：
  - `currentFile`: 当前打开的文件路径
  - `content`: 文件内容
  - `error`: 错误信息
  - `isDragging`: 拖拽状态
- 功能实现：
  - 打开文件（按钮点击）
  - 拖拽文件到窗口
  - 自动监听文件变化
  - 错误处理和显示

#### 2. Toolbar.tsx - 工具栏
- "打开文件"按钮
- 显示当前文件名

#### 3. PreviewPane.tsx - 预览区域
- 渲染 Markdown 内容为 HTML
- 显示空状态提示
- 显示错误信息
- 保持之前的预览内容（渲染失败时）

#### 4. MarkdownRenderer.ts - Markdown 渲染引擎
- 使用 marked 解析 Markdown
- 使用 highlight.js 代码高亮
- 使用 DOMPurify 清理 HTML（防止 XSS 攻击）
- LRU 缓存优化性能（最多 50 条）

#### 5. ErrorToast.tsx - 错误提示
- 显示错误类型和消息
- 自动关闭（5 秒）
- 手动关闭按钮

## 完整工作流程

### 1. 应用启动流程

```
1. 用户启动应用
   ↓
2. 主进程 index.ts 初始化
   ↓
3. MenuManager 创建中文菜单
   ↓
4. WindowManager 创建主窗口
   ↓
5. 加载 preload 脚本（preload.cjs）
   ↓
6. 加载渲染进程（React 应用）
   ↓
7. IPCHandler 注册 IPC 处理器
   ↓
8. 应用就绪，显示空状态提示
```

### 2. 打开文件流程（按钮方式）

```
1. 用户点击"打开文件"按钮
   ↓
2. App.tsx 调用 window.electronAPI.openFile()
   ↓
3. Preload 转发到主进程 IPC: 'open-file'
   ↓
4. IPCHandler 调用 FileHandler.openFileDialog()
   ↓
5. 显示系统文件选择对话框
   ↓
6. 用户选择 .md 文件
   ↓
7. 返回文件路径到渲染进程
   ↓
8. App.tsx 调用 window.electronAPI.readFile(filePath)
   ↓
9. Preload 验证路径并转发到主进程 IPC: 'read-file'
   ↓
10. IPCHandler 调用 FileHandler.readFile(filePath)
    ↓
11. 验证文件类型和安全性
    ↓
12. 读取文件内容
    ↓
13. FileWatcher 开始监视文件
    ↓
14. 返回文件内容到渲染进程
    ↓
15. App.tsx 更新 content 状态
    ↓
16. PreviewPane 调用 MarkdownRenderer.render()
    ↓
17. 渲染 Markdown 为 HTML
    ↓
18. DOMPurify 清理 HTML
    ↓
19. 显示预览内容
```

### 3. 拖拽文件流程

```
1. 用户拖拽 .md 文件到窗口
   ↓
2. App.tsx 触发 onDragEnter 事件
   ↓
3. 设置 isDragging = true，显示拖放提示
   ↓
4. 用户释放文件（onDrop 事件）
   ↓
5. 获取文件路径 (file.path)
   ↓
6. 验证文件扩展名（.md 或 .markdown）
   ↓
7. 调用 loadFileContent(filePath)
   ↓
8. 后续流程同"打开文件流程"步骤 8-19
```

### 4. 文件变化监听流程

```
1. 外部编辑器修改已打开的 .md 文件
   ↓
2. FileWatcher 检测到文件变化（chokidar）
   ↓
3. 防抖延迟 300ms
   ↓
4. 触发 onFileChange 回调
   ↓
5. IPCHandler 调用 FileHandler.readFile()
   ↓
6. 读取新的文件内容
   ↓
7. 发送 'file-changed' 事件到渲染进程
   ↓
8. App.tsx 接收事件，更新 content 状态
   ↓
9. PreviewPane 自动重新渲染
   ↓
10. 用户看到更新后的预览（无需手动刷新）
```

### 5. 错误处理流程

```
文件读取失败 / 文件监视错误
   ↓
主进程捕获错误
   ↓
IPCHandler 发送 'file-error' 事件
   ↓
App.tsx 接收错误消息
   ↓
设置 error 状态
   ↓
ErrorToast 显示错误提示（5秒自动关闭）
   ↓
PreviewPane 保持之前的内容（不清空）
```

## 安全特性

1. **上下文隔离**: 渲染进程无法直接访问 Node.js API
2. **沙箱模式**: 限制渲染进程的系统访问
3. **CSP 策略**: 防止 XSS 攻击
4. **路径验证**: 防止路径遍历攻击
5. **HTML 清理**: DOMPurify 清理所有 HTML 输出
6. **文件类型验证**: 只允许 .md 和 .markdown 文件

## 性能优化

1. **渲染缓存**: LRU 缓存最近 50 次渲染结果
2. **防抖处理**: 文件变化监听使用 300ms 防抖
3. **文件稳定性检测**: chokidar 等待文件写入完成后才触发事件

## 开发命令

```bash
# 开发模式（热重载）
yarn dev

# 构建渲染进程
yarn build:renderer

# 构建主进程
yarn build:electron

# 完整构建
yarn build

# 打包 Windows 应用
yarn build:win

# 打包 macOS 应用
yarn build:mac

# 打包 Linux 应用
yarn build:linux
```

## 构建产物

- `dist/` - 渲染进程构建产物（HTML, CSS, JS）
- `dist-electron/` - 主进程构建产物（main.cjs, preload.cjs）
- `release/` - 最终打包的可执行文件

## 技术栈

- **Electron 25**: 桌面应用框架
- **React 18**: UI 框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具
- **marked**: Markdown 解析
- **highlight.js**: 代码高亮
- **DOMPurify**: HTML 清理
- **chokidar**: 文件监视
