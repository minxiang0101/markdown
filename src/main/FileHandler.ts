import { dialog } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * FileHandler - 负责文件系统操作
 * 
 * 需求：1.1, 1.2, 1.3, 1.4, 6.1
 * - 1.1: 当用户点击"打开文件"按钮时，应用程序应当显示文件选择对话框
 * - 1.2: 当用户在文件选择对话框中选择一个 Markdown 文件时，应用程序应当加载该文件的内容
 * - 1.3: 当用户选择非 Markdown 文件时，应用程序应当显示错误提示并拒绝加载
 * - 1.4: 当文件读取失败时，应用程序应当显示错误消息并保持当前状态
 * - 6.1: 如果文件读取失败，则应用程序应当显示包含错误原因的提示消息
 */

export interface FileResult {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: {
    type: 'file-read' | 'file-type' | 'file-not-found' | 'permission-denied' | 'unknown';
    message: string;
  };
}

export class FileHandler {
  /**
   * 打开文件选择对话框
   * 需求 1.1: 显示文件选择对话框
   * 
   * @returns 选中的文件路径，如果用户取消则返回 null
   */
  async openFileDialog(): Promise<string | null> {
    try {
      const result = await dialog.showOpenDialog({
        title: '选择 Markdown 文件',
        filters: [
          { name: 'Markdown 文件', extensions: ['md', 'markdown'] },
          { name: '所有文件', extensions: ['*'] }
        ],
        properties: ['openFile']
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      return result.filePaths[0];
    } catch (error) {
      console.error('打开文件对话框失败:', error);
      return null;
    }
  }

  /**
   * 验证文件是否为 Markdown 文件
   * 需求 1.3: 验证文件类型
   * 
   * @param filePath 文件路径
   * @returns 是否为 Markdown 文件
   */
  isMarkdownFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.md' || ext === '.markdown';
  }

  /**
   * 验证文件路径安全性
   * 需求 2.1: 防止路径遍历攻击
   * 
   * @param filePath 文件路径
   * @returns 路径是否安全
   */
  private isPathSafe(filePath: string): boolean {
    // 规范化路径
    const normalizedPath = path.normalize(filePath);
    
    // 检查路径遍历
    if (normalizedPath.includes('..')) {
      return false;
    }
    
    // 检查绝对路径（Windows 和 Unix）
    if (!path.isAbsolute(normalizedPath)) {
      return false;
    }
    
    return true;
  }

  /**
   * 读取文件内容
   * 需求 1.2, 1.4, 6.1: 读取文件并处理错误
   * 需求 2.1: 限制文件系统访问权限
   * 
   * @param filePath 文件路径
   * @returns 文件操作结果
   */
  async readFile(filePath: string): Promise<FileResult> {
    try {
      // 验证路径安全性
      if (!this.isPathSafe(filePath)) {
        return {
          success: false,
          error: {
            type: 'file-read',
            message: '无效的文件路径'
          }
        };
      }

      // 验证文件类型
      if (!this.isMarkdownFile(filePath)) {
        return {
          success: false,
          error: {
            type: 'file-type',
            message: `无效的文件类型。只支持 .md 和 .markdown 文件。`
          }
        };
      }

      // 检查文件是否存在
      try {
        await fs.access(filePath);
      } catch {
        return {
          success: false,
          error: {
            type: 'file-not-found',
            message: `文件不存在: ${filePath}`
          }
        };
      }

      // 读取文件内容
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return {
          success: true,
          filePath,
          content
        };
      } catch (error: any) {
        // 处理权限错误
        if (error.code === 'EACCES' || error.code === 'EPERM') {
          return {
            success: false,
            error: {
              type: 'permission-denied',
              message: `没有权限读取文件: ${filePath}`
            }
          };
        }

        // 其他读取错误
        return {
          success: false,
          error: {
            type: 'file-read',
            message: `读取文件失败: ${error.message || '未知错误'}`
          }
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: {
          type: 'unknown',
          message: `发生未知错误: ${error.message || '未知错误'}`
        }
      };
    }
  }

  /**
   * 打开并读取文件的便捷方法
   * 结合文件对话框和文件读取
   * 
   * @returns 文件操作结果
   */
  async openAndReadFile(): Promise<FileResult> {
    const filePath = await this.openFileDialog();
    
    if (!filePath) {
      return {
        success: false,
        error: {
          type: 'unknown',
          message: '未选择文件'
        }
      };
    }

    return this.readFile(filePath);
  }
}
