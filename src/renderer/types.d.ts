// Type definitions for Electron API
// This file declares the global window.electronAPI interface

/**
 * 文件变化事件数据
 */
interface FileChangedData {
  filePath: string;
  content: string;
}

/**
 * 文件错误事件数据
 */
interface FileErrorData {
  filePath: string | null;
  message: string;
}

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
   * 关闭文件（停止监视）
   * @param filePath 文件路径
   * @returns 是否成功
   */
  closeFile: (filePath: string) => Promise<boolean>;

  /**
   * 保存文件内容
   * @param filePath 文件路径
   * @param content 文件内容
   * @returns 是否成功
   */
  saveFile: (filePath: string, content: string) => Promise<boolean>;

  /**
   * 显示保存文件对话框
   * @param defaultFileName 默认文件名
   * @returns 选择的文件路径，如果用户取消则返回 null
   */
  saveFileDialog: (defaultFileName?: string) => Promise<string | null>;

  /**
   * 监听文件变化事件
   * @param callback 文件变化时的回调函数，接收文件路径和内容
   */
  onFileChanged: (callback: (data: FileChangedData) => void) => void;

  /**
   * 监听文件错误事件
   * @param callback 发生错误时的回调函数，接收文件路径和错误消息
   */
  onFileError: (callback: (data: FileErrorData) => void) => void;

  /**
   * 监听初始文件打开事件
   * 当通过双击文件或拖拽文件到应用图标打开时触发
   * @param callback 接收文件路径的回调函数
   */
  onOpenInitialFile: (callback: (filePath: string) => void) => void;
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
