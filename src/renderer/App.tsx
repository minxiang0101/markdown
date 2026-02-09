// React 应用根组件
// 需求：1.2, 1.4, 3.2, 3.3, 6.1, 6.2
// - 1.2: 当用户在文件选择对话框中选择一个 Markdown 文件时，应用程序应当加载该文件的内容
// - 1.4: 当文件读取失败时，应用程序应当显示错误消息并保持当前状态
// - 3.2: 当检测到文件变化时，应用程序应当自动重新加载文件内容
// - 3.3: 当重新加载内容时，预览器应当更新显示而不需要用户手动刷新
// - 6.1: 如果文件读取失败，则应用程序应当显示包含错误原因的提示消息
// - 6.2: 如果 Markdown 渲染失败，则应用程序应当显示错误信息并保持之前的预览内容

import { useState, useEffect } from 'react'
import { Toolbar } from './Toolbar'
import { PreviewPane } from './PreviewPane'
import ErrorToast from './ErrorToast'
import './App.css'

/**
 * 错误信息接口
 */
interface ErrorInfo {
  type: 'file-read' | 'file-watch' | 'render' | 'unknown';
  message: string;
}

function App() {
  // 定义应用状态（需求：1.2, 1.4, 3.2, 6.1）
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [content, setContent] = useState<string>('')
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  /**
   * 打开文件处理函数
   * 需求 1.2: 加载文件内容
   * 需求 1.4: 错误处理
   * 需求 6.1: 显示错误消息
   */
  const handleOpenFile = async () => {
    try {
      // 调用 Electron API 打开文件对话框
      const filePath = await window.electronAPI.openFile()
      
      if (filePath) {
        setCurrentFile(filePath)
        // 加载文件内容
        await loadFileContent(filePath)
      }
    } catch (err) {
      // 需求 1.4, 6.1: 显示错误消息并保持当前状态
      const errorMessage = err instanceof Error ? err.message : '打开文件失败'
      setError({
        type: 'file-read',
        message: errorMessage
      })
    }
  }

  /**
   * 加载文件内容处理函数
   * 需求 1.2: 加载文件内容
   * 需求 1.4: 错误处理
   * 需求 6.1: 显示错误消息
   */
  const loadFileContent = async (filePath: string) => {
    try {
      // 读取文件内容
      const fileContent = await window.electronAPI.readFile(filePath)
      setContent(fileContent)
      setError(null)
    } catch (err) {
      // 需求 1.4, 6.1: 显示错误消息并保持当前状态
      const errorMessage = err instanceof Error ? err.message : '读取文件失败'
      setError({
        type: 'file-read',
        message: errorMessage
      })
      // 保持当前内容不变
    }
  }

  /**
   * 关闭错误提示
   */
  const handleCloseError = () => {
    setError(null)
  }

  /**
   * 提取文件名
   */
  const getFileName = (filePath: string | null): string | null => {
    if (!filePath) return null
    const parts = filePath.split(/[\\/]/)
    return parts[parts.length - 1]
  }

  /**
   * 处理文件拖拽进入
   */
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  /**
   * 处理文件拖拽离开
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // 只有当离开整个 app 区域时才设置为 false
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  /**
   * 处理文件拖拽
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * 处理文件放置
   */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      // 在 Electron 中，File 对象有 path 属性
      const filePath = (file as any).path

      // 检查是否为 Markdown 文件
      if (filePath && (filePath.endsWith('.md') || filePath.endsWith('.markdown'))) {
        setCurrentFile(filePath)
        await loadFileContent(filePath)
      } else {
        setError({
          type: 'file-read',
          message: '只支持 .md 和 .markdown 文件'
        })
      }
    }
  }

  /**
   * 设置文件变化监听
   * 需求 3.2: 自动重新加载文件内容
   * 需求 3.3: 更新显示而不需要用户手动刷新
   */
  useEffect(() => {
    // 监听文件变化事件
    window.electronAPI.onFileChanged((newContent: string) => {
      // 需求 3.2, 3.3: 自动更新内容
      setContent(newContent)
      setError(null)
    })

    // 监听文件错误事件
    // 需求 6.1: 显示错误消息
    window.electronAPI.onFileError((errorMessage: string) => {
      setError({
        type: 'file-watch',
        message: errorMessage
      })
      // 需求 6.2: 保持之前的预览内容
    })

    // 监听初始文件打开事件（双击文件或拖拽到应用图标打开）
    window.electronAPI.onOpenInitialFile(async (filePath: string) => {
      setCurrentFile(filePath)
      try {
        const fileContent = await window.electronAPI.readFile(filePath)
        setContent(fileContent)
        setError(null)
      } catch (err) {
        setError({
          type: 'file-read',
          message: err instanceof Error ? err.message : '读取文件失败'
        })
      }
    })
  }, [])

  return (
    <div 
      className={`app ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Toolbar 
        onOpenFile={handleOpenFile} 
        currentFileName={getFileName(currentFile)} 
      />
      <PreviewPane 
        content={content} 
        error={error?.message || null} 
      />
      <ErrorToast 
        error={error} 
        onClose={handleCloseError}
        autoCloseDuration={5000}
      />
    </div>
  )
}

export default App
