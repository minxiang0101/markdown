// 联想功能 Hook

import { useState, useCallback, useEffect } from 'react'
import { checkTrigger, extractHeadings, TriggerType } from './triggers'
import { getMarkdownSyntaxByTrigger, codeSyntax, MarkdownSyntaxItem } from './data/markdownSyntax'
import { filterEmoji, EmojiItem } from './data/emoji'

export interface AutocompleteItem {
  id: string
  label: string
  value: string
  description: string
  type: TriggerType
}

export interface AutocompleteState {
  isOpen: boolean
  items: AutocompleteItem[]
  selectedIndex: number
  position: { top: number; left: number }
  triggerType: TriggerType | null
  startPosition: number
  query: string
}

const MAX_ITEMS = 8

const initialState: AutocompleteState = {
  isOpen: false,
  items: [],
  selectedIndex: 0,
  position: { top: 0, left: 0 },
  triggerType: null,
  startPosition: 0,
  query: '',
}

/**
 * 计算光标在 textarea 中的像素位置
 */
function getCaretCoordinates(
  textarea: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  // 创建镜像 div
  const mirror = document.createElement('div')
  const style = getComputedStyle(textarea)

  // 复制 textarea 的样式
  const properties = [
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
    'letterSpacing', 'textTransform', 'wordSpacing',
    'textIndent', 'whiteSpace', 'wordWrap', 'wordBreak',
    'overflowWrap', 'lineHeight', 'padding', 'paddingTop',
    'paddingRight', 'paddingBottom', 'paddingLeft',
    'borderWidth', 'boxSizing',
  ]

  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.whiteSpace = 'pre-wrap'
  mirror.style.wordWrap = 'break-word'
  mirror.style.width = `${textarea.offsetWidth}px`

  properties.forEach(prop => {
    mirror.style[prop as any] = style[prop as keyof CSSStyleDeclaration] as string
  })

  document.body.appendChild(mirror)

  // 将光标前的文本放入镜像
  const textBeforeCursor = textarea.value.substring(0, position)
  const textNode = document.createTextNode(textBeforeCursor)
  mirror.appendChild(textNode)

  // 添加标记元素
  const marker = document.createElement('span')
  marker.textContent = '|'
  mirror.appendChild(marker)

  // 获取位置
  const coordinates = {
    top: marker.offsetTop - textarea.scrollTop,
    left: marker.offsetLeft - textarea.scrollLeft,
  }

  document.body.removeChild(mirror)

  return coordinates
}

export function useAutocomplete(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  content: string,
  onChange: (content: string) => void
) {
  const [state, setState] = useState<AutocompleteState>(initialState)

  /**
   * 关闭联想弹窗
   */
  const close = useCallback(() => {
    setState(initialState)
  }, [])

  /**
   * 获取联想项
   */
  const getItems = useCallback((
    type: TriggerType,
    query: string,
    documentContent: string
  ): AutocompleteItem[] => {
    let items: AutocompleteItem[] = []

    switch (type) {
      case 'markdown': {
        const syntaxItems = getMarkdownSyntaxByTrigger(query || '#')
        items = syntaxItems.map((item: MarkdownSyntaxItem) => ({
          id: `md-${item.label}`,
          label: item.label,
          value: item.value,
          description: item.description,
          type: 'markdown' as TriggerType,
        }))
        break
      }

      case 'code': {
        const filtered = codeSyntax.filter(item =>
          item.label.toLowerCase().includes(query.toLowerCase())
        )
        items = filtered.map((item: MarkdownSyntaxItem) => ({
          id: `code-${item.label}`,
          label: item.label,
          value: item.value,
          description: item.description,
          type: 'code' as TriggerType,
        }))
        break
      }

      case 'emoji': {
        const emojiItems = filterEmoji(query)
        items = emojiItems.map((item: EmojiItem) => ({
          id: `emoji-${item.shortcode}`,
          label: `${item.emoji} :${item.shortcode}:`,
          value: item.emoji,
          description: item.description,
          type: 'emoji' as TriggerType,
        }))
        break
      }

      case 'link': {
        const headings = extractHeadings(documentContent)
        items = headings.map(h => ({
          id: `link-${h.anchor}`,
          label: `${'#'.repeat(h.level)} ${h.text}`,
          value: `[${h.text}](#${h.anchor})`,
          description: `跳转到: ${h.text}`,
          type: 'link' as TriggerType,
        }))

        // 如果没有标题，添加默认的链接模板
        if (items.length === 0) {
          items = [
            {
              id: 'link-template',
              label: '[链接文本](url)',
              value: '[]()',
              description: '插入链接',
              type: 'link',
            },
            {
              id: 'image-template',
              label: '![图片描述](url)',
              value: '![]()',
              description: '插入图片',
              type: 'link',
            },
          ]
        }
        break
      }
    }

    return items.slice(0, MAX_ITEMS)
  }, [])

  /**
   * 处理输入变化，检测触发器
   */
  const handleInput = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPosition = textarea.selectionStart
    const result = checkTrigger(textarea.value, cursorPosition)

    if (result) {
      const items = getItems(result.trigger.type, result.query, content)

      if (items.length > 0) {
        const coordinates = getCaretCoordinates(textarea, cursorPosition)
        const rect = textarea.getBoundingClientRect()

        setState({
          isOpen: true,
          items,
          selectedIndex: 0,
          position: {
            top: rect.top + coordinates.top + 20, // 光标下方
            left: rect.left + coordinates.left,
          },
          triggerType: result.trigger.type,
          startPosition: result.startPosition,
          query: result.query,
        })
        return
      }
    }

    // 没有触发条件，关闭弹窗
    if (state.isOpen) {
      close()
    }
  }, [textareaRef, content, getItems, state.isOpen, close])

  /**
   * 选择一个联想项
   */
  const selectItem = useCallback((item: AutocompleteItem) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPosition = textarea.selectionStart
    let newContent: string
    let newCursorPosition: number

    switch (state.triggerType) {
      case 'emoji': {
        // 替换 :query 为 emoji
        const beforeTrigger = content.slice(0, state.startPosition)
        const afterCursor = content.slice(cursorPosition)
        newContent = beforeTrigger + item.value + afterCursor
        newCursorPosition = beforeTrigger.length + item.value.length
        break
      }

      case 'code': {
        // 替换整行为代码块
        const beforeTrigger = content.slice(0, state.startPosition)
        const afterCursor = content.slice(cursorPosition)
        newContent = beforeTrigger + item.value + afterCursor
        // 将光标放在代码块中间
        const codeBlockMiddle = item.value.indexOf('\n\n')
        newCursorPosition = beforeTrigger.length + codeBlockMiddle + 1
        break
      }

      case 'markdown': {
        // 替换当前行的触发内容
        const beforeTrigger = content.slice(0, state.startPosition)
        const afterCursor = content.slice(cursorPosition)
        newContent = beforeTrigger + item.value + afterCursor
        newCursorPosition = beforeTrigger.length + item.value.length
        break
      }

      case 'link': {
        // 替换 [ 或 ! 为完整链接
        const beforeTrigger = content.slice(0, state.startPosition)
        const afterCursor = content.slice(cursorPosition)
        newContent = beforeTrigger + item.value + afterCursor
        // 将光标放在链接文本位置
        const bracketIndex = item.value.indexOf('[') + 1
        newCursorPosition = beforeTrigger.length + bracketIndex
        break
      }

      default:
        return
    }

    onChange(newContent)
    close()

    // 恢复光标位置
    setTimeout(() => {
      if (textarea) {
        textarea.focus()
        textarea.selectionStart = textarea.selectionEnd = newCursorPosition
      }
    }, 0)
  }, [textareaRef, content, onChange, state.triggerType, state.startPosition, close])

  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent): boolean => {
    if (!state.isOpen) return false

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        setState(prev => ({
          ...prev,
          selectedIndex: prev.selectedIndex > 0
            ? prev.selectedIndex - 1
            : prev.items.length - 1,
        }))
        return true

      case 'ArrowDown':
        e.preventDefault()
        setState(prev => ({
          ...prev,
          selectedIndex: prev.selectedIndex < prev.items.length - 1
            ? prev.selectedIndex + 1
            : 0,
        }))
        return true

      case 'Enter':
      case 'Tab':
        e.preventDefault()
        if (state.items[state.selectedIndex]) {
          selectItem(state.items[state.selectedIndex])
        }
        return true

      case 'Escape':
        e.preventDefault()
        close()
        return true

      default:
        return false
    }
  }, [state.isOpen, state.items, state.selectedIndex, selectItem, close])

  /**
   * 监听内容变化
   */
  useEffect(() => {
    // 延迟检测，等待 DOM 更新
    const timer = setTimeout(() => {
      handleInput()
    }, 10)
    return () => clearTimeout(timer)
  }, [content, handleInput])

  return {
    isOpen: state.isOpen,
    items: state.items,
    selectedIndex: state.selectedIndex,
    position: state.position,
    selectItem,
    handleKeyDown,
    close,
  }
}
