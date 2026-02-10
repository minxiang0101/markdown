import { useState, useRef } from 'react';
import './TabBar.css';

/**
 * Tab 信息接口
 */
export interface TabInfo {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  isEditing: boolean;       // 是否处于编辑模式
  isNew: boolean;           // 是否是新建的未保存文件
  originalContent: string;  // 原始内容（用于检测是否有修改）
}

/**
 * TabBar 组件属性
 */
export interface TabBarProps {
  tabs: TabInfo[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabReorder: (tabs: TabInfo[]) => void;
}

/**
 * TabBar 组件
 * 显示打开的文件标签，支持切换、关闭和拖拽排序
 */
export function TabBar({ tabs, activeTabId, onTabSelect, onTabClose, onTabReorder }: TabBarProps) {
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const dragCounterRef = useRef(0);

  /**
   * 拖拽开始
   */
  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);

    // 添加拖拽样式
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      target.classList.add('dragging');
    }, 0);
  };

  /**
   * 拖拽结束
   */
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTabId(null);
    setDragOverTabId(null);
    dragCounterRef.current = 0;

    const target = e.currentTarget as HTMLElement;
    target.classList.remove('dragging');
  };

  /**
   * 拖拽进入
   */
  const handleDragEnter = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    dragCounterRef.current++;

    if (tabId !== draggedTabId) {
      setDragOverTabId(tabId);
    }
  };

  /**
   * 拖拽离开
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;

    if (dragCounterRef.current === 0) {
      setDragOverTabId(null);
    }
  };

  /**
   * 拖拽悬停
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  /**
   * 放置
   */
  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();
    setDragOverTabId(null);
    dragCounterRef.current = 0;

    if (!draggedTabId || draggedTabId === targetTabId) {
      return;
    }

    // 重新排序
    const newTabs = [...tabs];
    const draggedIndex = newTabs.findIndex(t => t.id === draggedTabId);
    const targetIndex = newTabs.findIndex(t => t.id === targetTabId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // 移除拖拽的标签并插入到目标位置
    const [draggedTab] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTab);

    onTabReorder(newTabs);
  };

  /**
   * 点击标签
   */
  const handleTabClick = (tabId: string) => {
    onTabSelect(tabId);
  };

  /**
   * 点击关闭按钮
   */
  const handleCloseClick = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation(); // 防止触发标签选择
    onTabClose(tabId);
  };

  // 没有标签时不显示
  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="tab-bar">
      {tabs.map((tab) => {
        const hasChanges = tab.content !== tab.originalContent;
        return (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''} ${tab.id === dragOverTabId ? 'drag-over' : ''} ${hasChanges ? 'has-changes' : ''}`}
            draggable
            onClick={() => handleTabClick(tab.id)}
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragEnd={handleDragEnd}
            onDragEnter={(e) => handleDragEnter(e, tab.id)}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, tab.id)}
            title={tab.filePath}
          >
            <span className="tab-name">
              {hasChanges && <span className="unsaved-dot"></span>}
              {tab.fileName}
            </span>
            <button
              className="tab-close"
              onClick={(e) => handleCloseClick(e, tab.id)}
              aria-label={`关闭 ${tab.fileName}`}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
