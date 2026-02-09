// React 应用根组件
// 需求：1.2, 1.4, 3.2, 3.3, 6.1, 6.2
// - 1.2: 当用户在文件选择对话框中选择一个 Markdown 文件时，应用程序应当加载该文件的内容
// - 1.4: 当文件读取失败时，应用程序应当显示错误消息并保持当前状态
// - 3.2: 当检测到文件变化时，应用程序应当自动重新加载文件内容
// - 3.3: 当重新加载内容时，预览器应当更新显示而不需要用户手动刷新
// - 6.1: 如果文件读取失败，则应用程序应当显示包含错误原因的提示消息
// - 6.2: 如果 Markdown 渲染失败，则应用程序应当显示错误信息并保持之前的预览内容

import { useState, useEffect, useCallback } from 'react'
import { Toolbar } from './Toolbar'
import { TabBar, TabInfo } from './TabBar'
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

/**
 * 生成唯一 Tab ID
 */
const generateTabId = (): string => {
  return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 从文件路径提取文件名
 */
const getFileName = (filePath: string): string => {
  const parts = filePath.split(/[\\/]/);
  return parts[parts.length - 1];
};

function App() {
  // 多标签状态
  const [tabs, setTabs] = useState<TabInfo[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  // 获取当前激活标签的内容
  const activeTab = tabs.find(t => t.id === activeTabId)
  const activeContent = activeTab?.content || ''

  /**
   * 打开文件并添加为新标签（或切换到已存在的标签）
   */
  const openFile = useCallback(async (filePath: string) => {
    // 检查文件是否已打开
    const existingTab = tabs.find(t => t.filePath === filePath)
    if (existingTab) {
      setActiveTabId(existingTab.id)
      return
    }

    try {
      const content = await window.electronAPI.readFile(filePath)
      const newTab: TabInfo = {
        id: generateTabId(),
        filePath,
        fileName: getFileName(filePath),
        content,
      }

      setTabs(prev => [...prev, newTab])
      setActiveTabId(newTab.id)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '打开文件失败'
      setError({ type: 'file-read', message: errorMessage })
    }
  }, [tabs])

  /**
   * 处理标签选择
   */
  const handleTabSelect = (tabId: string) => {
    setActiveTabId(tabId)
  }

  /**
   * 处理标签关闭
   */
  const handleTabClose = async (tabId: string) => {
    const tabToClose = tabs.find(t => t.id === tabId)
    if (!tabToClose) return

    // 通知主进程停止监视该文件
    try {
      await window.electronAPI.closeFile(tabToClose.filePath)
    } catch (err) {
      console.error('关闭文件监视失败:', err)
    }

    // 移除标签
    const newTabs = tabs.filter(t => t.id !== tabId)
    setTabs(newTabs)

    // 如果关闭的是当前激活的标签，切换到其他标签
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        // 切换到最后一个标签
        setActiveTabId(newTabs[newTabs.length - 1].id)
      } else {
        setActiveTabId(null)
      }
    }
  }

  /**
   * 处理标签重排序
   */
  const handleTabReorder = (newTabs: TabInfo[]) => {
    setTabs(newTabs)
  }

  /**
   * 关闭错误提示
   */
  const handleCloseError = () => {
    setError(null)
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
   * 处理文件放置（支持多文件）
   */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      const filePath = (file as any).path
      if (filePath && (filePath.endsWith('.md') || filePath.endsWith('.markdown'))) {
        await openFile(filePath)
      }
    }

    // 如果没有有效文件
    if (files.length > 0 && !files.some(f => {
      const path = (f as any).path
      return path && (path.endsWith('.md') || path.endsWith('.markdown'))
    })) {
      setError({
        type: 'file-read',
        message: '只支持 .md 和 .markdown 文件'
      })
    }
  }

  /**
   * 设置文件变化监听
   * 需求 3.2: 自动重新加载文件内容
   * 需求 3.3: 更新显示而不需要用户手动刷新
   */
  useEffect(() => {
    // 监听文件变化事件（包含文件路径）
    window.electronAPI.onFileChanged((data: { filePath: string; content: string }) => {
      setTabs(prev => prev.map(tab =>
        tab.filePath === data.filePath
          ? { ...tab, content: data.content }
          : tab
      ))
      setError(null)
    })

    // 监听文件错误事件
    window.electronAPI.onFileError((data: { filePath: string | null; message: string }) => {
      setError({
        type: 'file-watch',
        message: data.message
      })
    })

    // 监听初始文件打开事件（双击文件或拖拽到应用图标打开）
    window.electronAPI.onOpenInitialFile(async (filePath: string) => {
      // 检查文件是否已打开
      setTabs(prev => {
        const existingTab = prev.find(t => t.filePath === filePath)
        if (existingTab) {
          setActiveTabId(existingTab.id)
          return prev
        }
        return prev
      })

      // 如果文件未打开，则打开它
      try {
        const content = await window.electronAPI.readFile(filePath)
        const newTab: TabInfo = {
          id: generateTabId(),
          filePath,
          fileName: getFileName(filePath),
          content,
        }

        setTabs(prev => {
          // 再次检查是否已存在（防止竞态条件）
          if (prev.find(t => t.filePath === filePath)) {
            return prev
          }
          return [...prev, newTab]
        })
        setActiveTabId(newTab.id)
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
      <Toolbar />
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        onTabReorder={handleTabReorder}
      />
      <PreviewPane
        content={activeContent}
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
