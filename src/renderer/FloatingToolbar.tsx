// FloatingToolbar 组件 - 浮动工具栏
// 显示在预览区底部中间，提供下载和缩放功能

import './FloatingToolbar.css'

export interface FloatingToolbarProps {
  onExport: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];
const MIN_ZOOM = 25;
const MAX_ZOOM = 200;

export function FloatingToolbar({ onExport, zoom, onZoomChange }: FloatingToolbarProps) {
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
    </div>
  );
}
