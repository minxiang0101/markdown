import { useEffect } from 'react';
import './ErrorToast.css';

interface ErrorToastProps {
  error: { type: string; message: string } | null;
  onClose: () => void;
  autoCloseDuration?: number;
}

function ErrorToast({ error, onClose, autoCloseDuration = 5000 }: ErrorToastProps): JSX.Element | null {
  useEffect(() => {
    if (error && autoCloseDuration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [error, autoCloseDuration, onClose]);

  if (!error) {
    return null;
  }

  const getErrorTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'file-read': '文件读取错误',
      'file-watch': '文件监视错误',
      'render': '渲染错误',
      'unknown': '未知错误'
    };
    return labels[type] || '错误';
  };

  return (
    <div className="error-toast" role="alert" aria-live="assertive">
      <div className="error-toast-content">
        <div className="error-toast-header">
          <span className="error-toast-type">{getErrorTypeLabel(error.type)}</span>
          <button 
            className="error-toast-close" 
            onClick={onClose}
            aria-label="关闭错误提示"
          >
            ×
          </button>
        </div>
        <div className="error-toast-message">{error.message}</div>
      </div>
    </div>
  );
}

export default ErrorToast;
