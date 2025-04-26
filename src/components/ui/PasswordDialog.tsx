import React, { useState, useRef, useEffect } from 'react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { Button } from './Button';
import { useTheme } from '../../hooks/useTheme';

interface PasswordDialogProps {
  onSubmit: (password: string) => void;
  onCancel: () => void;
  error?: string | null;
}

export const PasswordDialog: React.FC<PasswordDialogProps> = ({ onSubmit, onCancel, error }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDark } = useTheme();

  // Focus the password input when the dialog opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onSubmit(password);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only trigger if the actual backdrop was clicked (not its children)
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center mb-5">
          <div className={`${isDark ? 'bg-zinc-800' : 'bg-zinc-100'} p-2 rounded-full mr-3`}>
            <FiLock className={`h-6 w-6 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`} />
          </div>
          <h3 className="font-montserrat font-semibold text-zinc-900 dark:text-zinc-100">
            Password Required
          </h3>
        </div>

        <p className="font-mono text-zinc-600 dark:text-zinc-400 mb-6">
          This PDF is password protected. Please enter the password to view it.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md text-sm font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              ref={inputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pr-10 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
              placeholder="Enter password"
              required
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
              <Button
                variant="icon"
                size="small"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="p-1"
                type="button"
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" size="small" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" size="small" type="submit" disabled={!password.trim()}>
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
