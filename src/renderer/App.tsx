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
import { Sidebar } from './Sidebar'
import { PreviewPane } from './PreviewPane'
import { EditorPane } from './EditorPane'
import { FloatingToolbar } from './FloatingToolbar'
import { defaultRenderer } from './MarkdownRenderer'
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [zoom, setZoom] = useState<number>(100)

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
        isEditing: false,
        isNew: false,
        originalContent: content,
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
   * 新建文件
   */
  const createNewFile = useCallback(() => {
    const newTabId = generateTabId()
    const defaultContent = '# 新建文档\n\n在此输入内容...'
    const newTab: TabInfo = {
      id: newTabId,
      filePath: '',
      fileName: '未命名.md',
      content: defaultContent,
      isEditing: true,  // 新建文件默认进入编辑模式
      isNew: true,
      originalContent: '',  // 新文件原始内容为空
    }

    setTabs(prev => [...prev, newTab])
    setActiveTabId(newTabId)
    setError(null)
  }, [])

  /**
   * 打开文件对话框
   */
  const handleOpenFileDialog = useCallback(async () => {
    try {
      const filePath = await window.electronAPI.openFile()
      if (filePath) {
        await openFile(filePath)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '打开文件失败'
      setError({ type: 'file-read', message: errorMessage })
    }
  }, [openFile])

  /**
   * 更新标签内容
   */
  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId
        ? { ...tab, content }
        : tab
    ))
  }, [])

  /**
   * 保存文件
   */
  const saveFile = useCallback(async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return

    try {
      let filePath = tab.filePath

      // 如果是新文件，显示保存对话框
      if (tab.isNew || !filePath) {
        const selectedPath = await window.electronAPI.saveFileDialog(tab.fileName)
        if (!selectedPath) {
          return // 用户取消了保存
        }
        filePath = selectedPath
      }

      // 保存文件
      await window.electronAPI.saveFile(filePath, tab.content)

      // 更新标签信息
      setTabs(prev => prev.map(t =>
        t.id === tabId
          ? {
              ...t,
              filePath,
              fileName: getFileName(filePath),
              isNew: false,
              originalContent: t.content,
            }
          : t
      ))

      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存文件失败'
      setError({ type: 'file-read', message: errorMessage })
    }
  }, [tabs])

  /**
   * 切换编辑/预览模式
   */
  const toggleEditMode = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (!tab) return

    // 如果当前是编辑模式，要切换到预览模式，检查是否有未保存的更改
    if (tab.isEditing) {
      const hasUnsavedChanges = tab.content !== tab.originalContent
      if (hasUnsavedChanges) {
        // 提示用户保存
        const shouldSave = window.confirm('当前文件有未保存的更改，是否先保存？\n\n点击"确定"保存后切换到预览\n点击"取消"放弃更改并切换到预览')
        if (shouldSave) {
          // 保存后切换
          saveFile(tabId).then(() => {
            setTabs(prev => prev.map(t =>
              t.id === tabId ? { ...t, isEditing: false } : t
            ))
          })
          return
        }
        // 用户选择不保存，恢复原始内容后切换
        setTabs(prev => prev.map(t =>
          t.id === tabId
            ? { ...t, isEditing: false, content: t.originalContent }
            : t
        ))
        return
      }
    }

    // 没有未保存更改，直接切换
    setTabs(prev => prev.map(t =>
      t.id === tabId
        ? { ...t, isEditing: !t.isEditing }
        : t
    ))
  }, [tabs, saveFile])

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
   * 切换侧边栏折叠状态
   */
  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(prev => !prev)
  }

  /**
   * 导出为 HTML 文件
   */
  const handleExport = useCallback(() => {
    if (!activeContent) return

    try {
      const renderedHtml = defaultRenderer.render(activeContent)
      const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown 导出</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; }
    code { font-family: 'SFMono-Regular', Consolas, monospace; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
    th { background: #f6f8fa; }
    blockquote { border-left: 4px solid #dfe2e5; margin: 0; padding-left: 1em; color: #6a737d; }
  </style>
</head>
<body>
${renderedHtml}
</body>
</html>`

      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = activeTab?.fileName?.replace(/\.(md|markdown)$/i, '.html') || 'markdown-export.html'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError({
        type: 'render',
        message: '导出失败: ' + (err instanceof Error ? err.message : '未知错误')
      })
    }
  }, [activeContent, activeTab?.fileName])

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
      try {
        const content = await window.electronAPI.readFile(filePath)
        const newTabId = generateTabId()

        // 使用函数式更新确保逻辑正确
        setTabs(prev => {
          // 检查文件是否已打开
          const existingTab = prev.find(t => t.filePath === filePath)
          if (existingTab) {
            // 已存在，设置为活动标签
            setActiveTabId(existingTab.id)
            return prev
          }

          // 不存在，创建新标签
          const newTab: TabInfo = {
            id: newTabId,
            filePath,
            fileName: getFileName(filePath),
            content,
            isEditing: false,
            isNew: false,
            originalContent: content,
          }
          setActiveTabId(newTabId)
          return [...prev, newTab]
        })
        setError(null)
      } catch (err) {
        setError({
          type: 'file-read',
          message: err instanceof Error ? err.message : '读取文件失败'
        })
      }
    })
  }, [])

  // 计算当前标签是否有未保存的更改
  const hasChanges = activeTab ? activeTab.content !== activeTab.originalContent : false

  return (
    <div
      className={`app ${isDragging ? 'dragging' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Toolbar onNewFile={createNewFile} onOpenFile={handleOpenFileDialog} />
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        onTabReorder={handleTabReorder}
      />
      <div className="main-container">
        {activeTab && (
          <Sidebar
            content={activeContent}
            isCollapsed={isSidebarCollapsed}
            onToggle={handleSidebarToggle}
          />
        )}
        {activeTab?.isEditing ? (
          <EditorPane
            content={activeContent}
            onChange={(content) => updateTabContent(activeTab.id, content)}
            onSave={() => saveFile(activeTab.id)}
          />
        ) : (
          <PreviewPane
            content={activeContent}
            error={error?.message || null}
            onDoubleClick={() => activeTab && toggleEditMode(activeTab.id)}
            zoom={zoom}
          />
        )}
      </div>
      {activeTab && (
        <FloatingToolbar
          isEditing={activeTab.isEditing}
          onToggleMode={() => toggleEditMode(activeTab.id)}
          onSave={() => saveFile(activeTab.id)}
          hasChanges={hasChanges}
          onExport={handleExport}
          zoom={zoom}
          onZoomChange={setZoom}
        />
      )}
      <ErrorToast
        error={error}
        onClose={handleCloseError}
        autoCloseDuration={5000}
      />
    </div>
  )
}

export default App
