// Type definitions for Electron API
// This file declares the global window.electronAPI interface

/**
 * Electron API 接口
 */
interface ElectronAPI {
  /**
   * 打开文件选择对话框
   * @returns 选中的文件路径，如果用户取消则返回 null
   */
  openFile: () => Promise<string | null>;
  
  /**
   * 读取文件内容
   * @param filePath 文件路径
   * @returns 文件内容
   */
  readFile: (filePath: string) => Promise<string>;
  
  /**
   * 监听文件变化事件
   * @param callback 文件变化时的回调函数
   */
  onFileChanged: (callback: (content: string) => void) => void;
  
  /**
   * 监听文件错误事件
   * @param callback 发生错误时的回调函数
   */
  onFileError: (callback: (error: string) => void) => void;
}

/**
 * 扩展 Window 接口
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
