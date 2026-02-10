// 联想弹窗组件

import { useEffect, useRef } from 'react'
import { AutocompleteItem } from './useAutocomplete'
import './AutocompletePopup.css'

export interface AutocompletePopupProps {
  isOpen: boolean
  items: AutocompleteItem[]
  selectedIndex: number
  position: { top: number; left: number }
  onSelect: (item: AutocompleteItem) => void
  onClose: () => void
}

export function AutocompletePopup({
  isOpen,
  items,
  selectedIndex,
  position,
  onSelect,
  onClose,
}: AutocompletePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // 滚动到选中项
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // 调整位置避免超出视口
  useEffect(() => {
    if (!isOpen || !popupRef.current) return

    const popup = popupRef.current
    const rect = popup.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // 如果弹窗底部超出视口，显示在光标上方
    if (rect.bottom > viewportHeight) {
      popup.style.top = `${position.top - rect.height - 30}px`
    }

    // 如果弹窗右侧超出视口，左移
    if (rect.right > viewportWidth) {
      popup.style.left = `${viewportWidth - rect.width - 10}px`
    }
  }, [isOpen, position])

  if (!isOpen || items.length === 0) return null

  return (
    <div
      ref={popupRef}
      className="autocomplete-popup"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="autocomplete-list">
        {items.map((item, index) => (
          <div
            key={item.id}
            ref={index === selectedIndex ? selectedRef : null}
            className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => onSelect(item)}
            onMouseEnter={() => {
              // 可以添加悬停选中效果
            }}
          >
            <span className="autocomplete-item-label">{item.label}</span>
            <span className="autocomplete-item-description">{item.description}</span>
          </div>
        ))}
      </div>
      <div className="autocomplete-footer">
        <span>↑↓ 导航</span>
        <span>Enter 选择</span>
        <span>Esc 关闭</span>
      </div>
    </div>
  )
}
