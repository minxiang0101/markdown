// EditorPane 组件
// 提供 Markdown 文本编辑功能

import { useEffect, useRef } from 'react'
import './EditorPane.css'
import { useAutocomplete, AutocompletePopup } from './autocomplete'

/**
 * EditorPane 组件属性接口
 */
export interface EditorPaneProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
}

/**
 * EditorPane 组件
 * 负责编辑 Markdown 内容
 */
export function EditorPane({ content, onChange, onSave }: EditorPaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 联想功能
  const autocomplete = useAutocomplete(textareaRef, content, onChange)

  // 自动聚焦
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  /**
   * 处理内容变化
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  /**
   * 处理键盘快捷键
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 联想激活时优先处理联想键盘事件
    if (autocomplete.isOpen) {
      if (['ArrowUp', 'ArrowDown', 'Enter', 'Tab', 'Escape'].includes(e.key)) {
        if (autocomplete.handleKeyDown(e)) {
          return
        }
      }
    }

    // Ctrl+S 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      onSave?.()
    }

    // Tab 键插入缩进（仅在联想未激活时）
    if (e.key === 'Tab' && !autocomplete.isOpen) {
      e.preventDefault()
      const textarea = textareaRef.current
      if (textarea) {
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const value = textarea.value
        const newValue = value.substring(0, start) + '  ' + value.substring(end)
        onChange(newValue)
        // 恢复光标位置
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2
        }, 0)
      }
    }
  }

  return (
    <div className="editor-pane">
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="在此输入 Markdown 内容..."
        spellCheck={false}
      />
      <AutocompletePopup
        isOpen={autocomplete.isOpen}
        items={autocomplete.items}
        selectedIndex={autocomplete.selectedIndex}
        position={autocomplete.position}
        onSelect={autocomplete.selectItem}
        onClose={autocomplete.close}
      />
    </div>
  )
}
