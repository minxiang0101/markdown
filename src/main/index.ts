// Electron 主进程入口文件
// 使用 WindowManager 管理应用窗口

import { app, BrowserWindow } from 'electron';
import { WindowManager } from './WindowManager';
import { IPCHandler } from './IPCHandler';
import { MenuManager } from './MenuManager';

// 创建窗口管理器实例
const windowManager = new WindowManager();

// 创建 IPC 处理器实例
const ipcHandler = new IPCHandler();

// 创建菜单管理器实例
const menuManager = new MenuManager();

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
