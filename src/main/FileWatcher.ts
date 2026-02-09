import chokidar, { FSWatcher } from 'chokidar';

/**
 * FileWatcher - 负责监视多个文件变化
 *
 * 需求：3.1, 3.2, 6.3
 * - 3.1: 当已打开的 Markdown 文件在外部被修改时，应用程序应当检测到文件变化
 * - 3.2: 当检测到文件变化时，应用程序应当自动重新加载文件内容
 * - 6.3: 如果文件监视失败，则应用程序应当记录错误但继续正常运行
 */

export type FileChangeCallback = (filePath: string) => void;
export type FileErrorCallback = (error: Error, filePath: string | null) => void;

export class FileWatcher {
  private watcher: FSWatcher | null = null;
  private watchedFiles: Set<string> = new Set();
  private changeCallbacks: FileChangeCallback[] = [];
  private errorCallbacks: FileErrorCallback[] = [];
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly debounceDelay: number = 300; // 300ms 防抖延迟

  /**
   * 添加文件到监视列表
   * @param filePath 要监视的文件路径
   */
  addFile(filePath: string): void {
    // 如果已经在监视，跳过
    if (this.watchedFiles.has(filePath)) {
      return;
    }

    try {
      if (!this.watcher) {
        // 首次监视，创建 watcher
        this.watcher = chokidar.watch(filePath, {
          persistent: true,
          ignoreInitial: true,
          awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50
          }
        });

        this.setupWatcherEvents();
      } else {
        // 添加到现有 watcher
        this.watcher.add(filePath);
      }

      this.watchedFiles.add(filePath);
    } catch (error) {
      console.error('添加文件监视失败:', error);
      this.notifyError(error as Error, filePath);
    }
  }

  /**
   * 从监视列表移除文件
   * @param filePath 要移除的文件路径
   */
  removeFile(filePath: string): void {
    if (!this.watchedFiles.has(filePath)) {
      return;
    }

    // 清除该文件的防抖定时器
    const timer = this.debounceTimers.get(filePath);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(filePath);
    }

    // 从 watcher 移除
    if (this.watcher) {
      this.watcher.unwatch(filePath);
    }

    this.watchedFiles.delete(filePath);

    // 如果没有文件需要监视了，关闭 watcher
    if (this.watchedFiles.size === 0 && this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  /**
   * 开始监视指定文件（兼容旧 API）
   * @deprecated 请使用 addFile 代替
   * @param filePath 要监视的文件路径
   */
  watch(filePath: string): void {
    this.addFile(filePath);
  }

  /**
   * 停止监视所有文件
   */
  async unwatch(): Promise<void> {
    // 清除所有防抖定时器
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();

    if (this.watcher) {
      try {
        await this.watcher.close();
      } catch (error) {
        console.error('关闭文件监视器失败:', error);
      } finally {
        this.watcher = null;
      }
    }

    this.watchedFiles.clear();
  }

  /**
   * 设置 watcher 事件监听
   */
  private setupWatcherEvents(): void {
    if (!this.watcher) return;

    // 监听文件变化事件
    this.watcher.on('change', (path: string) => {
      this.debouncedNotifyChange(path);
    });

    // 监听文件删除事件
    this.watcher.on('unlink', (path: string) => {
      this.notifyError(new Error(`文件已被删除: ${path}`), path);
      this.watchedFiles.delete(path);
    });

    // 监听错误事件
    this.watcher.on('error', (error: Error) => {
      console.error('文件监视错误:', error);
      this.notifyError(error, null);
    });
  }

  /**
   * 注册文件变化回调
   * @param callback 文件变化时的回调函数
   */
  onFileChange(callback: FileChangeCallback): void {
    this.changeCallbacks.push(callback);
  }

  /**
   * 注册错误回调
   * @param callback 发生错误时的回调函数
   */
  onFileError(callback: FileErrorCallback): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * 移除文件变化回调
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
   * @param callback 要移除的回调函数
   */
  removeFileErrorCallback(callback: FileErrorCallback): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  /**
   * 检查是否正在监视指定文件
   * @param filePath 文件路径
   * @returns 是否正在监视
   */
  isWatchingFile(filePath: string): boolean {
    return this.watchedFiles.has(filePath);
  }

  /**
   * 获取所有正在监视的文件
   * @returns 文件路径数组
   */
  getWatchedFiles(): string[] {
    return Array.from(this.watchedFiles);
  }

  /**
   * 检查是否有文件在监视
   * @returns 是否正在监视
   */
  isWatching(): boolean {
    return this.watcher !== null && this.watchedFiles.size > 0;
  }

  /**
   * 通知所有注册的变化回调（带防抖）
   * @param filePath 变化的文件路径
   */
  private debouncedNotifyChange(filePath: string): void {
    // 清除该文件之前的定时器
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      this.notifyChange(filePath);
      this.debounceTimers.delete(filePath);
    }, this.debounceDelay);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * 通知所有注册的变化回调
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
   * @param error 错误对象
   * @param filePath 相关文件路径
   */
  private notifyError(error: Error, filePath: string | null): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error, filePath);
      } catch (err) {
        console.error('错误回调执行失败:', err);
      }
    });
  }
}
