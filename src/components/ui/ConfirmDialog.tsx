import React, { memo } from 'react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen?: boolean;
  title?: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = memo(
  ({
    isOpen = true,
    title = '',
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
  }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onCancel}
      >
        <div
          className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-sm w-full shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <h3 className="text-sm font-montserrat font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              {title}
            </h3>
          )}
          <div className="font-mono text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {description}
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" size="small" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button variant="primary" size="small" onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
