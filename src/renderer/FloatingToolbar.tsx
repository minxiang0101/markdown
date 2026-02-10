// FloatingToolbar 组件 - 浮动工具栏
// 显示在预览区底部中间，提供下载、缩放和模式切换功能

import './FloatingToolbar.css'

export interface FloatingToolbarProps {
  onExport: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isEditing: boolean;
  onToggleMode: () => void;
  onSave?: () => void;
  hasChanges?: boolean;
}

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];
const MIN_ZOOM = 25;
const MAX_ZOOM = 200;

export function FloatingToolbar({ onExport, zoom, onZoomChange, isEditing, onToggleMode, onSave, hasChanges }: FloatingToolbarProps) {
  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.findIndex(z => z >= zoom);
    const newIndex = Math.max(0, currentIndex - 1);
    onZoomChange(ZOOM_LEVELS[newIndex]);
  };

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.findIndex(z => z >= zoom);
    const newIndex = Math.min(ZOOM_LEVELS.length - 1, currentIndex + 1);
    onZoomChange(ZOOM_LEVELS[newIndex]);
  };

  return (
    <div className="floating-toolbar">
      {/* 模式切换按钮 */}
      <button
        className="floating-btn mode-btn"
        onClick={onToggleMode}
        title={isEditing ? '切换到预览' : '切换到编辑'}
      >
        {isEditing ? (
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        )}
        <span>{isEditing ? '预览' : '编辑'}</span>
      </button>

      {/* 保存按钮 - 仅在编辑模式下显示 */}
      {isEditing && onSave && (
        <button
          className={`floating-btn save-btn ${hasChanges ? 'has-changes' : ''}`}
          onClick={onSave}
          title="保存 (Ctrl+S)"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
          </svg>
          <span>保存</span>
        </button>
      )}

      {/* 导出按钮 - 仅在预览模式下显示 */}
      {!isEditing && (
        <button
          className="floating-btn export-btn"
          onClick={onExport}
          title="导出"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          <span>下载</span>
        </button>
      )}

      {/* 缩放控制 - 仅在预览模式下显示 */}
      {!isEditing && (
        <div className="zoom-controls">
          <button
            className="zoom-btn"
            onClick={handleZoomOut}
            disabled={zoom <= MIN_ZOOM}
            title="缩小"
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
            </svg>
          </button>
          <span className="zoom-value">{zoom}%</span>
          <button
            className="zoom-btn"
            onClick={handleZoomIn}
            disabled={zoom >= MAX_ZOOM}
            title="放大"
          >
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
