// Sidebar 组件 - 显示可折叠的目录结构
// 从 Markdown 内容中提取标题，生成目录树

import { useState, useEffect, useMemo } from 'react'
import { generateHeadingId } from './MarkdownRenderer'
import './Sidebar.css'

/**
 * 目录项接口
 */
interface TocItem {
  id: string;
  headingId: string; // 用于滚动定位的 id
  level: number;
  text: string;
  children: TocItem[];
}

/**
 * Sidebar 组件属性接口
 */
export interface SidebarProps {
  content: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * 移除 Markdown 中的代码块内容
 * 防止代码块中的 # 注释被误识别为标题
 */
const removeCodeBlocks = (content: string): string => {
  // 移除围栏式代码块 ```...```
  return content.replace(/```[\s\S]*?```/g, '')
}

/**
 * 从 Markdown 内容中提取标题
 */
const extractHeadings = (content: string): TocItem[] => {
  // 先移除代码块，避免代码中的 # 被识别为标题
  const contentWithoutCode = removeCodeBlocks(content)

  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: { level: number; text: string; index: number }[] = []
  let match
  let index = 0

  while ((match = headingRegex.exec(contentWithoutCode)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    headings.push({ level, text, index })
    index++
  }

  return buildTree(headings)
}

/**
 * 将扁平的标题列表构建成树形结构
 */
const buildTree = (headings: { level: number; text: string; index: number }[]): TocItem[] => {
  const root: TocItem[] = []
  const stack: { item: TocItem; level: number }[] = []

  headings.forEach((heading) => {
    // 使用与 MarkdownRenderer 相同的 id 生成逻辑
    const headingId = generateHeadingId(heading.text, heading.index)

    const item: TocItem = {
      id: `toc-${headingId}`, // 目录项的唯一 id
      headingId: headingId,   // 对应标题元素的 id
      level: heading.level,
      text: heading.text,
      children: [],
    }

    // 找到合适的父节点
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop()
    }

    if (stack.length === 0) {
      root.push(item)
    } else {
      stack[stack.length - 1].item.children.push(item)
    }

    stack.push({ item, level: heading.level })
  })

  return root
}

/**
 * 目录项组件
 */
interface TocItemComponentProps {
  item: TocItem;
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
  onItemClick: (headingId: string) => void;
}

function TocItemComponent({ item, expandedItems, onToggleExpand, onItemClick }: TocItemComponentProps) {
  const hasChildren = item.children.length > 0
  const isExpanded = expandedItems.has(item.id)

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleExpand(item.id)
  }

  const handleClick = () => {
    onItemClick(item.headingId)
  }

  return (
    <li className={`toc-item level-${item.level}`}>
      <div className="toc-item-content" onClick={handleClick}>
        {hasChildren && (
          <span
            className={`toc-toggle ${isExpanded ? 'expanded' : ''}`}
            onClick={handleToggle}
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
            </svg>
          </span>
        )}
        {!hasChildren && <span className="toc-toggle-placeholder" />}
        <span className="toc-text">{item.text}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul className="toc-children">
          {item.children.map(child => (
            <TocItemComponent
              key={child.id}
              item={child}
              expandedItems={expandedItems}
              onToggleExpand={onToggleExpand}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

/**
 * Sidebar 组件
 * 显示可折叠的文档目录结构
 */
export function Sidebar({ content, isCollapsed, onToggle }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // 从内容中提取目录
  const tocItems = useMemo(() => extractHeadings(content), [content])

  // 当内容变化时，默认展开所有一级标题
  useEffect(() => {
    const initialExpanded = new Set<string>()
    tocItems.forEach(item => {
      initialExpanded.add(item.id)
    })
    setExpandedItems(initialExpanded)
  }, [tocItems])

  const handleToggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleItemClick = (headingId: string) => {
    // 滚动到对应的标题位置
    const element = document.getElementById(headingId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleExpandAll = () => {
    const allIds = new Set<string>()
    const collectIds = (items: TocItem[]) => {
      items.forEach(item => {
        allIds.add(item.id)
        collectIds(item.children)
      })
    }
    collectIds(tocItems)
    setExpandedItems(allIds)
  }

  const handleCollapseAll = () => {
    setExpandedItems(new Set())
  }

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <span className="sidebar-title">目录</span>
        <div className="sidebar-actions">
          {!isCollapsed && (
            <>
              <button
                className="sidebar-action-btn"
                onClick={handleExpandAll}
                title="全部展开"
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z" />
                </svg>
              </button>
              <button
                className="sidebar-action-btn"
                onClick={handleCollapseAll}
                title="全部折叠"
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M7.41 18.59L8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10l4.59-4.59z" />
                </svg>
              </button>
            </>
          )}
          <button
            className="sidebar-toggle-btn"
            onClick={onToggle}
            title={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path
                fill="currentColor"
                d={isCollapsed
                  ? "M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"
                  : "M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="sidebar-content">
          {tocItems.length > 0 ? (
            <ul className="toc-list">
              {tocItems.map(item => (
                <TocItemComponent
                  key={item.id}
                  item={item}
                  expandedItems={expandedItems}
                  onToggleExpand={handleToggleExpand}
                  onItemClick={handleItemClick}
                />
              ))}
            </ul>
          ) : (
            <div className="toc-empty">
              <p>暂无目录</p>
              <p className="toc-empty-hint">文档中没有标题</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
