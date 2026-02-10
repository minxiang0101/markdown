// 触发器配置

export type TriggerType = 'markdown' | 'emoji' | 'link' | 'code'

export interface Trigger {
  char: string
  type: TriggerType
  requirePosition: 'line-start' | 'word-start' | 'any'
  minChars?: number  // 触发前需要的最少字符数
}

/**
 * 触发器配置列表
 */
export const triggers: Trigger[] = [
  // Markdown 语法触发器
  { char: '#', type: 'markdown', requirePosition: 'line-start' },
  { char: '-', type: 'markdown', requirePosition: 'line-start' },
  { char: '*', type: 'markdown', requirePosition: 'line-start' },
  { char: '>', type: 'markdown', requirePosition: 'line-start' },
  { char: '|', type: 'markdown', requirePosition: 'line-start' },

  // 代码块触发器
  { char: '`', type: 'code', requirePosition: 'line-start' },

  // Emoji 触发器
  { char: ':', type: 'emoji', requirePosition: 'word-start', minChars: 1 },

  // 链接触发器
  { char: '[', type: 'link', requirePosition: 'any' },
  { char: '!', type: 'link', requirePosition: 'any' },
]

/**
 * 检测当前输入位置是否满足触发条件
 */
export function checkTrigger(
  text: string,
  cursorPosition: number
): { trigger: Trigger; query: string; startPosition: number } | null {
  if (cursorPosition === 0) return null

  // 获取当前行的起始位置
  const lineStart = text.lastIndexOf('\n', cursorPosition - 1) + 1
  const textBeforeCursor = text.slice(lineStart, cursorPosition)

  // 检查 emoji 触发器 - 特殊处理，需要查找 :
  const colonIndex = textBeforeCursor.lastIndexOf(':')
  if (colonIndex !== -1) {
    const textAfterColon = textBeforeCursor.slice(colonIndex + 1)
    // 确保冒号后没有空格，且有输入内容
    if (!/\s/.test(textAfterColon) && textAfterColon.length >= 1) {
      const emojiTrigger = triggers.find(t => t.type === 'emoji')
      if (emojiTrigger) {
        return {
          trigger: emojiTrigger,
          query: textAfterColon,
          startPosition: lineStart + colonIndex,
        }
      }
    }
  }

  // 检查代码块触发器 - 检测 ```
  if (textBeforeCursor.startsWith('```')) {
    const codeTrigger = triggers.find(t => t.type === 'code')
    if (codeTrigger) {
      const query = textBeforeCursor.slice(3)
      // 确保没有换行符（还在输入语言名称）
      if (!query.includes('\n')) {
        return {
          trigger: codeTrigger,
          query,
          startPosition: lineStart,
        }
      }
    }
  }

  // 检查行首触发器
  for (const trigger of triggers) {
    if (trigger.requirePosition === 'line-start') {
      if (textBeforeCursor.startsWith(trigger.char)) {
        // 对于 # 检查是否是标题语法
        if (trigger.char === '#') {
          const match = textBeforeCursor.match(/^(#{1,6})\s*$/)
          if (match) {
            return {
              trigger,
              query: match[1],
              startPosition: lineStart,
            }
          }
        }
        // 对于其他行首触发器，只在输入单个字符时触发
        else if (textBeforeCursor === trigger.char) {
          return {
            trigger,
            query: '',
            startPosition: lineStart,
          }
        }
      }
    }
  }

  // 检查链接触发器
  const lastChar = textBeforeCursor.slice(-1)
  const linkTrigger = triggers.find(t => t.type === 'link' && t.char === lastChar)
  if (linkTrigger) {
    // 对于 ! 触发器，检查是否是图片语法的开始
    if (lastChar === '!' && textBeforeCursor.length === 1) {
      return {
        trigger: linkTrigger,
        query: '',
        startPosition: cursorPosition - 1,
      }
    }
    // 对于 [ 触发器
    if (lastChar === '[') {
      return {
        trigger: linkTrigger,
        query: '',
        startPosition: cursorPosition - 1,
      }
    }
  }

  return null
}

/**
 * 从文档内容中提取标题用于链接联想
 */
export function extractHeadings(content: string): { level: number; text: string; anchor: string }[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: { level: number; text: string; anchor: string }[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    // 生成 anchor（简化版，实际 Markdown 解析器可能有不同规则）
    const anchor = text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-')

    headings.push({ level, text, anchor })
  }

  return headings
}
