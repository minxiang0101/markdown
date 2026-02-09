import chokidar, { FSWatcher } from 'chokidar';

/**
 * FileWatcher - 负责监视文件变化
 * 
 * 需求：3.1, 3.2, 6.3
 * - 3.1: 当已打开的 Markdown 文件在外部被修改时，应用程序应当检测到文件变化
 * - 3.2: 当检测到文件变化时，应用程序应当自动重新加载文件内容
 * - 6.3: 如果文件监视失败，则应用程序应当记录错误但继续正常运行
 */

export type FileChangeCallback = (filePath: string) => void;
export type FileErrorCallback = (error: Error) => void;

export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private currentFilePath: string | null = null;
  private changeCallbacks: FileChangeCallback[] = [];
  private errorCallbacks: FileErrorCallback[] = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly debounceDelay: number = 300; // 300ms 防抖延迟

  /**
   * 开始监视指定文件
   * 需求 3.1: 检测文件变化
   * 
   * @param filePath 要监视的文件路径
   */
  watch(filePath: string): void {
    // 如果已经在监视其他文件，先停止
    if (this.watcher) {
      this.unwatch();
    }

    try {
      this.currentFilePath = filePath;

      // 使用 chokidar 监视文件
      this.watcher = chokidar.watch(filePath, {
        persistent: true,
        ignoreInitial: true, // 忽略初始添加事件
        awaitWriteFinish: {
          stabilityThreshold: 100, // 文件稳定后才触发事件
          pollInterval: 50
        }
      });

      // 监听文件变化事件
      // 需求 3.2: 添加防抖以优化性能
      this.watcher.on('change', (path: string) => {
        this.debouncedNotifyChange(path);
      });

      // 监听文件删除事件
      this.watcher.on('unlink', (path: string) => {
        this.notifyError(new Error(`文件已被删除: ${path}`));
      });

      // 监听错误事件
      // 需求 6.3: 记录错误但继续运行
      this.watcher.on('error', (error: Error) => {
        console.error('文件监视错误:', error);
        this.notifyError(error);
        // 不中断应用，继续运行
      });

    } catch (error) {
      // 需求 6.3: 容错处理
      console.error('启动文件监视失败:', error);
      this.notifyError(error as Error);
      // 不抛出异常，允许应用继续运行
    }
  }

  /**
   * 停止监视当前文件
   */
  async unwatch(): Promise<void> {
    // 清除防抖定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.watcher) {
      try {
        await this.watcher.close();
      } catch (error) {
        console.error('关闭文件监视器失败:', error);
      } finally {
        this.watcher = null;
        this.currentFilePath = null;
      }
    }
  }

  /**
   * 注册文件变化回调
   * 需求 3.2: 自动重新加载文件内容
   * 
   * @param callback 文件变化时的回调函数
   */
  onFileChange(callback: FileChangeCallback): void {
    this.changeCallbacks.push(callback);
  }

  /**
   * 注册错误回调
   * 需求 6.3: 错误处理
   * 
   * @param callback 发生错误时的回调函数
   */
  onFileError(callback: FileErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * 移除文件变化回调
   * 
   * @param callback 要移除的回调函数
   */
  removeFileChangeCallback(callback: FileChangeCallback): void {
    const index = this.changeCallbacks.indexOf(callback);
    if (index > -1) {
      this.changeCallbacks.splice(index, 1);
    }
  }

  /**
   * 移除错误回调
   * 
   * @param callback 要移除的回调函数
   */
  removeFileErrorCallback(callback: FileErrorCallback): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  /**
   * 获取当前监视的文件路径
   * 
   * @returns 当前监视的文件路径，如果没有则返回 null
   */
  getCurrentFilePath(): string | null {
    return this.currentFilePath;
  }

  /**
   * 检查是否正在监视文件
   * 
   * @returns 是否正在监视
   */
  isWatching(): boolean {
    return this.watcher !== null;
  }

  /**
   * 通知所有注册的变化回调（带防抖）
   * 需求 3.2: 防抖优化，避免频繁更新
   * 
   * @param filePath 变化的文件路径
   */
  private debouncedNotifyChange(filePath: string): void {
    // 清除之前的定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // 设置新的定时器
    this.debounceTimer = setTimeout(() => {
      this.notifyChange(filePath);
      this.debounceTimer = null;
    }, this.debounceDelay);
  }

  /**
   * 通知所有注册的变化回调
   * 
   * @param filePath 变化的文件路径
   */
  private notifyChange(filePath: string): void {
    this.changeCallbacks.forEach(callback => {
      try {
        callback(filePath);
      } catch (error) {
        console.error('文件变化回调执行失败:', error);
      }
    });
  }

  /**
   * 通知所有注册的错误回调
   * 
   * @param error 错误对象
   */
  private notifyError(error: Error): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (err) {
        console.error('错误回调执行失败:', err);
      }
    });
  }
}
