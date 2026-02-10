// PreviewPane 组件
// 需求：2.1, 2.2, 2.3, 2.4, 2.5, 4.2, 4.3, 4.4, 6.1, 6.2
// - 2.1: 当 Markdown 文件加载成功时，渲染引擎应当将 Markdown 语法转换为 HTML
// - 2.2: 当渲染 HTML 内容时，预览器应当正确显示标题、列表、代码块、链接和图片
// - 2.3: 当 Markdown 内容包含代码块时，预览器应当使用等宽字体并保持代码格式
// - 2.4: 当 Markdown 内容包含表格时，预览器应当以表格形式正确显示
// - 2.5: 当 Markdown 内容为空时，预览器应当显示空白页面
// - 4.2: 应用程序应当在工具栏下方显示预览区域
// - 4.3: 当没有打开文件时，预览区域应当显示提示信息引导用户打开文件
// - 4.4: 当窗口大小改变时，预览区域应当自动调整以适应新的窗口尺寸
// - 6.1: 如果文件读取失败，则应用程序应当显示包含错误原因的提示消息
// - 6.2: 如果 Markdown 渲染失败，则应用程序应当显示错误信息并保持之前的预览内容

import { useState, useEffect, useRef } from 'react'
import { defaultRenderer } from './MarkdownRenderer'
import './PreviewPane.css'

/**
 * PreviewPane 组件属性接口
 */
export interface PreviewPaneProps {
  content: string;
  error: string | null;
  onDoubleClick?: () => void;
  zoom?: number;
}

/**
 * PreviewPane 组件
 * 负责显示渲染后的 Markdown 内容或错误信息
 */
export function PreviewPane({ content, error, onDoubleClick, zoom = 100 }: PreviewPaneProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>('')
  const [renderError, setRenderError] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  /**
   * 渲染 Markdown 内容
   * 需求 2.1: 将 Markdown 转换为 HTML
   * 需求 6.2: 渲染失败时显示错误并保持之前的内容
   */
  useEffect(() => {
    if (content) {
      try {
        // 需求 2.1: 使用 MarkdownRenderer 渲染内容
        const html = defaultRenderer.render(content)
        setRenderedHtml(html)
        setRenderError(null)
      } catch (err) {
        // 需求 6.2: 显示错误信息并保持之前的预览内容
        const errorMessage = err instanceof Error ? err.message : '渲染失败'
        setRenderError(errorMessage)
        // 保持 renderedHtml 不变
      }
    } else {
      // 需求 2.5: 空内容时显示空白
      setRenderedHtml('')
      setRenderError(null)
    }
  }, [content])

  /**
   * 处理双击事件
   */
  const handleDoubleClick = () => {
    onDoubleClick?.()
  }

  // 需求 6.1: 显示文件读取错误
  if (error) {
    return (
      <div className="preview-pane">
        <div className="error-message">
          <h3>错误</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // 需求 4.3: 显示空状态提示
  if (!content && !renderedHtml) {
    return (
      <div className="preview-pane">
        <div className="empty-state">
          <p>点击"新建文件"创建新的 Markdown 文件，或点击"打开文件"选择现有文件</p>
          <p className="hint">双击预览区域可切换到编辑模式</p>
        </div>
      </div>
    )
  }

  // 需求 6.2: 显示渲染错误（但保持之前的内容）
  if (renderError) {
    return (
      <div className="preview-pane" onDoubleClick={handleDoubleClick}>
        <div className="render-error">
          <p>渲染错误：{renderError}</p>
        </div>
        {renderedHtml && (
          <div
            className="preview-content"
            style={{ fontSize: `${zoom}%` }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        )}
      </div>
    )
  }

  // 需求 2.2, 2.3, 2.4, 4.2, 4.4: 显示渲染后的内容
  return (
    <div className="preview-pane" onDoubleClick={handleDoubleClick}>
      <div
        ref={contentRef}
        className="preview-content"
        style={{ fontSize: `${zoom}%` }}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    </div>
  )
}
