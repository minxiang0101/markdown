// 工具栏组件
// 需求：1.1, 4.1
// - 1.1: 当用户点击"打开文件"按钮时，应用程序应当显示文件选择对话框
// - 4.1: 应用程序应当在顶部显示工具栏，包含"打开文件"按钮

import './Toolbar.css'

/**
 * 工具栏组件属性接口
 */
export interface ToolbarProps {
  /** 打开文件的回调函数 */
  onOpenFile: () => void;
  /** 当前打开的文件名 */
  currentFileName: string | null;
}

/**
 * 工具栏组件
 * 需求 1.1: 显示"打开文件"按钮
 * 需求 4.1: 在顶部显示工具栏
 */
export function Toolbar({ onOpenFile, currentFileName }: ToolbarProps) {
  return (
    <div className="toolbar">
      <button 
        className="open-file-btn" 
        onClick={onOpenFile}
        aria-label="打开文件"
      >
        打开文件
      </button>
      {currentFileName && (
        <span className="file-name" title={currentFileName}>
          {currentFileName}
        </span>
      )}
    </div>
  )
}
