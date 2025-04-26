import { useEffect, useState, useCallback, memo } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import { Button } from './Button';
import { ShowToast } from '../../types/toast';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export const Toast = memo(({ message, type = 'info', duration = 5000, onClose }: ToastProps) => {
  const [visible, setVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 300); // Duration of exit animation
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />;
      case 'info':
      default:
        return <FiInfo className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />;
    }
  };

  return (
    <div
      className={`flex items-center w-full max-w-sm p-4 mb-4 rounded-sm shadow border 
      bg-white dark:bg-zinc-900 border-zinc-400 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200
      transition-all duration-300 transform
      ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100'}
      `}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 mr-3">{getIcon()}</div>
      <div className="text-sm font-mono font-normal flex-grow">{message}</div>
      <Button
        variant="icon"
        size="small"
        className="ml-auto -mx-1.5 -my-1.5"
        onClick={handleClose}
        aria-label="Close"
      >
        <FiX className="w-4 h-4" />
      </Button>
    </div>
  );
});

// Define the shape of our toast data objects
interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export const ToastContainer: React.FC = memo(() => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Export these functions to window for global access
  useEffect(() => {
    const addToast = (message: string, type: ToastType = 'info', duration = 5000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      return id;
    };

    // Create the showToast object that matches our type definition
    const showToastFunctions: ShowToast = {
      info: (message: string, duration?: number) => addToast(message, 'info', duration),
      success: (message: string, duration?: number) => addToast(message, 'success', duration),
      warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
      error: (message: string, duration?: number) => addToast(message, 'error', duration),
    };

    // Add toast functions to window
    window.showToast = showToastFunctions;

    return () => {
      // Clean up - set to undefined instead of using delete
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.showToast = undefined as any;
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div key={toast.id} className="transform-gpu animate-slideInRight">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
});
