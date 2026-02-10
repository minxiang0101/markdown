// 工具栏组件
// 需求：4.1
// - 4.1: 应用程序应当在顶部显示工具栏

import './Toolbar.css'

/**
 * 工具栏组件属性
 */
export interface ToolbarProps {
  onNewFile?: () => void;
  onOpenFile?: () => void;
}

/**
 * 工具栏组件
 * 需求 4.1: 在顶部显示工具栏
 */
export function Toolbar({ onNewFile, onOpenFile }: ToolbarProps) {
  return (
    <div className="toolbar">
      <span className="toolbar-title">Markdown 预览</span>
      <div className="toolbar-actions">
        <button
          className="toolbar-btn new-file-btn"
          onClick={onNewFile}
          title="新建文件 (Ctrl+N)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"/>
          </svg>
          <span>新建</span>
        </button>
        <button
          className="toolbar-btn open-file-btn"
          onClick={onOpenFile}
          title="打开文件 (Ctrl+O)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
          </svg>
          <span>打开</span>
        </button>
      </div>
    </div>
  )
}
