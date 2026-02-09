// Electron 主进程入口文件
// 使用 WindowManager 管理应用窗口

import { app, BrowserWindow } from 'electron';
import path from 'path';
import { WindowManager } from './WindowManager';
import { IPCHandler } from './IPCHandler';
import { MenuManager } from './MenuManager';

// 创建窗口管理器实例
const windowManager = new WindowManager();

// 创建 IPC 处理器实例
const ipcHandler = new IPCHandler();

// 创建菜单管理器实例
const menuManager = new MenuManager();

// 存储待打开的文件路径（用于双击文件或拖拽到图标打开）
let pendingFilePath: string | null = null;

/**
 * 检查文件路径是否为 Markdown 文件
 */
function isMarkdownFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.md' || ext === '.markdown';
}

/**
 * 从启动参数中提取 Markdown 文件路径
 * Windows: 双击文件打开时，文件路径会作为命令行参数传入
 */
function getFilePathFromArgs(): string | null {
  // process.argv[0] 是 electron 可执行文件
  // process.argv[1] 是应用程序路径（开发环境）或 . （生产环境）
  // process.argv[2+] 是传入的参数
  const args = process.argv.slice(1);

  for (const arg of args) {
    // 跳过以 - 开头的选项参数
    if (arg.startsWith('-')) continue;
    // 跳过开发环境的项目路径
    if (arg === '.' || arg.endsWith('electron.vite.config.ts')) continue;

    // 检查是否为 Markdown 文件
    if (isMarkdownFile(arg)) {
      return arg;
    }
  }
  return null;
}

/**
 * 发送初始文件路径到渲染进程
 */
function sendInitialFile(window: BrowserWindow, filePath: string): void {
  // 等待页面加载完成后发送
  if (window.webContents.isLoading()) {
    window.webContents.once('did-finish-load', () => {
      window.webContents.send('open-initial-file', filePath);
    });
  } else {
    window.webContents.send('open-initial-file', filePath);
  }
}

/**
 * 应用准备就绪时创建窗口
 */
app.whenReady().then(() => {
  // 创建应用菜单
  menuManager.createMenu();

  const window = windowManager.createWindow();

  // 设置 IPC 处理器的主窗口引用
  if (window) {
    ipcHandler.setMainWindow(window);
  }

  // 注册 IPC 处理器
  ipcHandler.setupHandlers();

  // 检查启动参数中是否有文件路径（Windows 双击文件打开）
  const filePathFromArgs = getFilePathFromArgs();
  if (filePathFromArgs && window) {
    sendInitialFile(window, filePathFromArgs);
  }

  // 处理 macOS open-file 事件之前缓存的文件路径
  if (pendingFilePath && window) {
    sendInitialFile(window, pendingFilePath);
    pendingFilePath = null;
  }

  // macOS 特性：点击 Dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWindow = windowManager.createWindow();
      if (newWindow) {
        ipcHandler.setMainWindow(newWindow);
      }
    }
  });
});

/**
 * macOS: 处理文件关联打开事件
 * 当用户双击 .md 文件或将文件拖到应用图标时触发
 */
app.on('open-file', (event, filePath) => {
  event.preventDefault();

  if (!isMarkdownFile(filePath)) {
    return;
  }

  const window = windowManager.getWindow();
  if (window) {
    sendInitialFile(window, filePath);
  } else {
    // 应用尚未准备好，缓存文件路径
    pendingFilePath = filePath;
  }
});

/**
 * 所有窗口关闭时退出应用
 * macOS 除外（用户通常期望应用保持活动状态）
 * 
 * 需求 5.3: 当用户关闭窗口时，应用程序应当完全退出
 */
app.on('window-all-closed', () => {
  // 清理 IPC 处理器资源
  ipcHandler.cleanup();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
