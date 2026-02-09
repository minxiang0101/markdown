// Electron preload 脚本
// 通过 contextBridge 暴露安全的 API 给渲染进程
//
// 需求：1.1, 1.2, 3.2, 6.1
// - 1.1: 当用户点击"打开文件"按钮时，应用程序应当显示文件选择对话框
// - 1.2: 当用户在文件选择对话框中选择一个 Markdown 文件时，应用程序应当加载该文件的内容
// - 3.2: 当检测到文件变化时，应用程序应当自动重新加载文件内容
// - 6.1: 如果文件读取失败，则应用程序应当显示包含错误原因的提示消息

import { contextBridge, ipcRenderer } from 'electron';

/**
 * 文件变化事件数据
 */
export interface FileChangedData {
  filePath: string;
  content: string;
}

/**
 * 文件错误事件数据
 */
export interface FileErrorData {
  filePath: string | null;
  message: string;
}

/**
 * 定义暴露给渲染进程的 API 接口
 */
export interface ElectronAPI {
  /**
   * 打开文件选择对话框
   * 需求 1.1: 显示文件选择对话框
   * @returns 选中的文件路径，如果用户取消则返回 null
   */
  openFile: () => Promise<string | null>;

  /**
   * 读取文件内容
   * 需求 1.2: 加载文件内容
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
   * 监听文件变化事件
   * 需求 3.2: 自动重新加载文件内容
   * @param callback 文件变化时的回调函数，接收文件路径和内容
   */
  onFileChanged: (callback: (data: FileChangedData) => void) => void;

  /**
   * 监听文件错误事件
   * 需求 6.1: 显示错误消息
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
 * 通过 contextBridge 安全地暴露 API
 * 使用 contextIsolation 确保安全性
 * 需求 2.1: 限制文件系统访问权限
 */
contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('open-file'),

  readFile: (filePath: string) => {
    // 验证文件路径参数
    if (typeof filePath !== 'string' || filePath.trim() === '') {
      return Promise.reject(new Error('无效的文件路径'));
    }
    // 防止路径遍历攻击
    if (filePath.includes('..') || filePath.includes('~')) {
      return Promise.reject(new Error('无效的文件路径：不允许路径遍历'));
    }
    return ipcRenderer.invoke('read-file', filePath);
  },

  closeFile: (filePath: string) => {
    // 验证文件路径参数
    if (typeof filePath !== 'string' || filePath.trim() === '') {
      return Promise.reject(new Error('无效的文件路径'));
    }
    return ipcRenderer.invoke('close-file', filePath);
  },

  onFileChanged: (callback: (data: FileChangedData) => void) => {
    // 验证回调函数
    if (typeof callback !== 'function') {
      throw new Error('回调函数必须是一个函数');
    }
    ipcRenderer.on('file-changed', (_event, data) => {
      // 验证接收到的数据格式
      if (data && typeof data.filePath === 'string' && typeof data.content === 'string') {
        callback(data);
      }
    });
  },

  onFileError: (callback: (data: FileErrorData) => void) => {
    // 验证回调函数
    if (typeof callback !== 'function') {
      throw new Error('回调函数必须是一个函数');
    }
    ipcRenderer.on('file-error', (_event, data) => {
      // 验证接收到的数据格式
      if (data && typeof data.message === 'string') {
        callback(data);
      }
    });
  },

  onOpenInitialFile: (callback: (filePath: string) => void) => {
    // 验证回调函数
    if (typeof callback !== 'function') {
      throw new Error('回调函数必须是一个函数');
    }
    ipcRenderer.on('open-initial-file', (_event, filePath) => {
      // 验证接收到的路径是字符串
      if (typeof filePath === 'string') {
        callback(filePath);
      }
    });
  }
} as ElectronAPI);

/**
 * 声明全局类型，使 TypeScript 识别 window.electronAPI
 */
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
