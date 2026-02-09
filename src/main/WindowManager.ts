import { BrowserWindow, app } from 'electron';
import path from 'path';

/**
 * WindowManager - 负责创建和管理应用窗口
 * 
 * 需求：5.1, 5.3, 5.4
 * - 5.1: 应用程序应当作为独立的桌面窗口运行
 * - 5.3: 当用户关闭窗口时，应用程序应当完全退出
 * - 5.4: 应用程序应当具有标准的窗口控制功能（最小化、最大化、关闭）
 */
export class WindowManager {
  private mainWindow: BrowserWindow | null = null;

  /**
   * 创建主窗口
   * 配置窗口尺寸、最小尺寸和 webPreferences
   * @returns 创建的窗口实例或 null
   */
  createWindow(): BrowserWindow | null {
    // 如果窗口已存在，不重复创建
    if (this.mainWindow !== null) {
      return this.mainWindow;
    }

    // 创建主窗口配置
    this.mainWindow = new BrowserWindow({
      width: 1200,           // 默认宽度
      height: 800,           // 默认高度
      minWidth: 800,         // 最小宽度
      minHeight: 600,        // 最小高度
      title: 'Markdown 预览工具',  // 窗口标题
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        nodeIntegration: false,    // 禁用 Node.js 集成以提高安全性
        contextIsolation: true,    // 启用上下文隔离
        sandbox: true,             // 启用沙箱模式
        webSecurity: true,         // 启用 Web 安全
        allowRunningInsecureContent: false,  // 禁止运行不安全内容
        experimentalFeatures: false,         // 禁用实验性功能
        enableRemoteModule: false            // 禁用远程模块
      }
    });

    // 加载应用内容
    this.loadContent();

    // 配置 Content Security Policy
    this.setupContentSecurityPolicy();

    // 禁用默认的拖放文件导航行为，让渲染进程处理拖放
    this.disableDefaultDragDrop();

    // 监听窗口关闭事件
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  /**
   * 加载窗口内容
   * 开发环境加载 Vite 开发服务器，生产环境加载构建后的文件
   */
  private loadContent(): void {
    if (!this.mainWindow) {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      // 开发环境：加载 Vite 开发服务器
      this.mainWindow.loadURL('http://localhost:5173');
    } else {
      // 生产环境：加载构建后的文件
      this.mainWindow.loadFile(path.join(__dirname, '../dist-renderer/index.html'));
    }
  }

  /**
   * 配置 Content Security Policy
   * 需求 2.1: 防止 XSS 攻击
   */
  private setupContentSecurityPolicy(): void {
    if (!this.mainWindow) {
      return;
    }

    // 检查 webContents.session 是否可用（在测试环境中可能不可用）
    if (!this.mainWindow.webContents.session || !this.mainWindow.webContents.session.webRequest) {
      return;
    }

    // 设置 CSP 头
    this.mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            // 默认策略：只允许同源
            "default-src 'self';",
            // 脚本：允许同源和内联脚本（React 需要）
            "script-src 'self' 'unsafe-inline';",
            // 样式：允许同源和内联样式
            "style-src 'self' 'unsafe-inline';",
            // 图片：允许同源、data URI 和 https
            "img-src 'self' data: https:;",
            // 字体：允许同源和 data URI
            "font-src 'self' data:;",
            // 连接：允许同源（用于 WebSocket 等）
            "connect-src 'self';",
            // 禁止对象、嵌入和框架
            "object-src 'none';",
            "frame-src 'none';",
            "base-uri 'self';",
            "form-action 'self';"
          ].join(' ')
        }
      });
    });
  }

  /**
   * 禁用默认的拖放文件导航行为
   * 让渲染进程可以自定义处理拖放事件
   */
  private disableDefaultDragDrop(): void {
    if (!this.mainWindow) {
      return;
    }

    // 阻止 Electron 默认将拖放的文件作为导航处理
    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      // 如果是文件协议，阻止导航（拖放文件会触发 file:// 导航）
      if (url.startsWith('file://')) {
        event.preventDefault();
      }
    });
  }

  /**
   * 关闭窗口并清理资源
   */
  closeWindow(): void {
    if (this.mainWindow) {
      this.mainWindow.close();
      this.mainWindow = null;
    }
  }

  /**
   * 获取主窗口实例
   * @returns 主窗口实例或 null
   */
  getWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * 检查窗口是否存在
   * @returns 窗口是否存在
   */
  hasWindow(): boolean {
    return this.mainWindow !== null && !this.mainWindow.isDestroyed();
  }
}
