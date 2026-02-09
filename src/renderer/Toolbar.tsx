// 工具栏组件
// 需求：4.1
// - 4.1: 应用程序应当在顶部显示工具栏

import './Toolbar.css'

/**
 * 工具栏组件
 * 需求 4.1: 在顶部显示工具栏
 */
export function Toolbar() {
  return (
    <div className="toolbar">
      <span className="toolbar-title">Markdown 预览</span>
    </div>
  )
}
