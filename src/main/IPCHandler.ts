import { ipcMain, BrowserWindow } from 'electron';
import { FileHandler } from './FileHandler';
import { FileWatcher } from './FileWatcher';

/**
 * IPCHandler - 负责处理进程间通信
 *
 * 需求：1.1, 1.2, 3.2
 * - 1.1: 当用户点击"打开文件"按钮时，应用程序应当显示文件选择对话框
 * - 1.2: 当用户在文件选择对话框中选择一个 Markdown 文件时，应用程序应当加载该文件的内容
 * - 3.2: 当检测到文件变化时，应用程序应当自动重新加载文件内容
 */

export class IPCHandler {
  private fileHandler: FileHandler;
  private fileWatcher: FileWatcher;
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    this.fileHandler = new FileHandler();
    this.fileWatcher = new FileWatcher();
  }

  /**
   * 设置主窗口引用
   * 用于向渲染进程发送事件
   *
   * @param window 主窗口实例
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * 注册所有 IPC 处理器
   * 需求 1.1, 1.2, 3.2
   */
  setupHandlers(): void {
    this.handleOpenFile();
    this.handleReadFile();
    this.handleCloseFile();
    this.setupFileWatcher();
  }

  /**
   * 注册 'open-file' 处理器
   * 需求 1.1: 显示文件选择对话框
   */
  private handleOpenFile(): void {
    ipcMain.handle('open-file', async () => {
      try {
        const filePath = await this.fileHandler.openFileDialog();
        return filePath;
      } catch (error: any) {
        console.error('打开文件对话框失败:', error);
        this.sendFileError({
          type: 'unknown',
          message: `打开文件对话框失败: ${error.message || '未知错误'}`
        }, null);
        return null;
      }
    });
  }

  /**
   * 注册 'read-file' 处理器
   * 需求 1.2: 加载文件内容
   */
  private handleReadFile(): void {
    ipcMain.handle('read-file', async (_event, filePath: string) => {
      try {
        const result = await this.fileHandler.readFile(filePath);

        if (!result.success) {
          // 发送错误事件到渲染进程
          this.sendFileError(result.error!, filePath);
          throw new Error(result.error!.message);
        }

        // 添加文件到监视列表（支持多文件）
        this.fileWatcher.addFile(filePath);

        return result.content;
      } catch (error: any) {
        console.error('读取文件失败:', error);
        throw error;
      }
    });
  }

  /**
   * 注册 'close-file' 处理器
   * 关闭文件时停止监视
   */
  private handleCloseFile(): void {
    ipcMain.handle('close-file', async (_event, filePath: string) => {
      try {
        this.fileWatcher.removeFile(filePath);
        return true;
      } catch (error: any) {
        console.error('关闭文件监视失败:', error);
        return false;
      }
    });
  }

  /**
   * 设置文件监视器
   * 需求 3.2: 自动重新加载文件内容
   */
  private setupFileWatcher(): void {
    // 监听文件变化
    this.fileWatcher.onFileChange(async (filePath: string) => {
      try {
        const result = await this.fileHandler.readFile(filePath);

        if (result.success) {
          // 发送文件变化事件到渲染进程（包含文件路径）
          this.sendFileChanged(filePath, result.content!);
        } else {
          // 发送错误事件
          this.sendFileError(result.error!, filePath);
        }
      } catch (error: any) {
        console.error('重新加载文件失败:', error);
        this.sendFileError({
          type: 'file-read',
          message: `重新加载文件失败: ${error.message || '未知错误'}`
        }, filePath);
      }
    });

    // 监听文件错误（现在包含文件路径）
    this.fileWatcher.onFileError((error: Error, filePath: string | null) => {
      this.sendFileError({
        type: 'file-read',
        message: error.message
      }, filePath);
    });
  }

  /**
   * 发送文件变化事件到渲染进程
   * 需求 3.2: 通知渲染进程文件已更新
   *
   * @param filePath 文件路径
   * @param content 新的文件内容
   */
  private sendFileChanged(filePath: string, content: string): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('file-changed', { filePath, content });
    }
  }

  /**
   * 发送错误事件到渲染进程
   * 需求 6.1: 显示错误消息
   *
   * @param error 错误信息
   * @param filePath 相关文件路径
   */
  private sendFileError(error: { type: string; message: string }, filePath: string | null): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('file-error', {
        filePath,
        message: error.message,
        type: error.type
      });
    }
  }

  /**
   * 清理资源
   * 停止文件监视
   */
  async cleanup(): Promise<void> {
    await this.fileWatcher.unwatch();
  }
}
