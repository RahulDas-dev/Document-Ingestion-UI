import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Document, Page } from 'react-pdf';
import {
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn,
  FiZoomOut,
  FiDownload,
  FiX,
  FiMaximize2,
  FiMinimize2,
  FiLoader,
  FiLock,
} from 'react-icons/fi';
import { PDF_OPTIONS } from '../utils/PdfWorker';
import { Button } from './ui/Button';

// Lazy load the PasswordDialog to defer loading until needed
const LazyPasswordDialog = lazy(() =>
  import('./ui/PasswordDialog').then((module) => ({ default: module.PasswordDialog }))
);

interface PDFPreviewProps {
  file: File | null;
  onClose: () => void;
  isPasswordProtected?: boolean;
  savedPassword?: string; // Add support for a saved password
  onPasswordSaved?: (password: string) => void; // Callback to save password
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  file,
  onClose,
  isPasswordProtected,
  savedPassword,
  onPasswordSaved,
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.2);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState<boolean>(false);
  const [password, setPassword] = useState<string>(savedPassword || '');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordAttempts, setPasswordAttempts] = useState<number>(0);
  const [isPasswordValidated, setIsPasswordValidated] = useState<boolean>(!!savedPassword);

  // Check if the file is password protected when component mounts
  useEffect(() => {
    if (file) {
      if (isPasswordProtected && !savedPassword) {
        // If password protected and no saved password, show dialog
        setShowPasswordDialog(true);
      } else if (isPasswordProtected && savedPassword) {
        // If we have a saved password, use it
        setPassword(savedPassword);
      }
    }
  }, [file, isPasswordProtected, savedPassword]);

  // Create URL for the file when component mounts
  useEffect(() => {
    if (file) {
      // Force using our application's loading mechanism
      // Ensure we're using the worker from our configuration
      const url = URL.createObjectURL(file);
      setFileUrl(url);

      // Clean up the URL when the component unmounts
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Prepare PDF options with password if provided
  const pdfOptions = useMemo(() => {
    return password
      ? {
          ...PDF_OPTIONS,
          password,
          // Add these options to prevent browser's built-in dialog
          isEvalSupported: false,
          disableAutoFetch: true,
          disableStream: true,
          // This forces PDF.js to use our password handler
          ownerPassword: password,
          userPassword: password,
        }
      : {
          ...PDF_OPTIONS,
          // Add these options to prevent browser's built-in dialog
          isEvalSupported: false,
          disableAutoFetch: true,
          disableStream: true,
        };
  }, [password]);

  // Create file object with a key that changes when password changes
  // This forces a complete reload of the Document component when password changes
  const documentFile = useMemo(() => {
    if (!fileUrl) return null;

    // Add a unique key that changes when the password changes
    // This will force the Document component to reload with the new password
    return {
      url: fileUrl,
      passwordAttempt: passwordAttempts,
      password,
    };
  }, [fileUrl, passwordAttempts, password]);

  // Memoize page navigation state
  const pageNavigationState = useMemo(() => {
    return {
      isFirstPage: pageNumber <= 1,
      isLastPage: pageNumber >= (numPages || 0),
      currentPage: pageNumber,
      totalPages: numPages || 0,
    };
  }, [pageNumber, numPages]);

  // Function to navigate to the next page
  const nextPage = useCallback(() => {
    if (pageNumber < (numPages || 0)) {
      setPageNumber((prev) => prev + 1);
    }
  }, [pageNumber, numPages]);

  // Function to navigate to the previous page
  const previousPage = useCallback(() => {
    if (pageNumber > 1) {
      setPageNumber((prev) => prev - 1);
    }
  }, [pageNumber]);

  // Function to zoom in
  const zoomIn = useCallback(() => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  }, []);

  // Function to zoom out
  const zoomOut = useCallback(() => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.6));
  }, []);

  // Function to reset zoom
  const resetZoom = useCallback(() => {
    setScale(1.2); // Reset to default scale
  }, []);

  // Function to toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const container = document.getElementById('pdf-container');
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Function to download the PDF
  const downloadPDF = useCallback(() => {
    if (!file) return;

    // Create a download link and trigger download
    const a = document.createElement('a');
    a.href = fileUrl || '';
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [file, fileUrl]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setPageNumber(1);
      setPasswordError(null);

      // Mark password as validated on successful load
      if (isPasswordProtected && password) {
        setIsPasswordValidated(true);
      }

      // If we successfully loaded with a password, save it
      if (isPasswordProtected && password && onPasswordSaved) {
        onPasswordSaved(password);
      }
    },
    [isPasswordProtected, password, onPasswordSaved]
  );

  const onDocumentLoadError = useCallback(
    (err: Error) => {
      console.error('Error loading PDF:', err);

      // Check if error is related to password protection
      if (
        (err.name === 'PasswordException' || String(err).includes('password')) &&
        !isPasswordValidated
      ) {
        // Only show password dialog if password hasn't been validated yet
        setShowPasswordDialog(true);

        // Set appropriate error message based on attempt count
        if (passwordAttempts > 0) {
          setPasswordError('Incorrect password. Please try again.');
        } else {
          setPasswordError(null);
        }
      } else {
        setError(err.message);
      }
    },
    [passwordAttempts, isPasswordValidated]
  );

  const handlePasswordSubmit = useCallback((enteredPassword: string) => {
    setPassword(enteredPassword);
    setShowPasswordDialog(false);
    setPasswordAttempts((prev) => prev + 1);
    setPasswordError(null);
    // Clear any existing error message when a new password is submitted
    setError(null);
    // Reset validation status when trying a new password
    setIsPasswordValidated(false);
  }, []);

  const handlePasswordCancel = useCallback(() => {
    setShowPasswordDialog(false);

    // Set a more descriptive error to indicate user canceled password entry
    setError('Password entry was canceled. This PDF requires a password to view.');

    // Clear any existing password to prevent partial loading
    setPassword('');
  }, []);

  // Add this effect to intercept browser password dialogs
  useEffect(() => {
    // Function to intercept and prevent default browser dialogs
    const preventDefaultDialogs = (event: any) => {
      if (event.preventDefault) {
        event.preventDefault();
      }
      return false;
    };

    // Add event listeners for prompts, alerts, etc.
    window.addEventListener('beforeunload', preventDefaultDialogs);

    // Check if "prompt" is in the window object and can be overridden
    const originalPrompt = window.prompt;
    window.prompt = function () {
      // If password is already validated or we're showing our dialog, prevent browser prompt
      if (isPasswordValidated || showPasswordDialog || passwordError) {
        return null; // Prevent browser prompt
      }
      // Otherwise show our custom dialog
      setShowPasswordDialog(true);
      return null;
    };

    return () => {
      // Clean up
      window.removeEventListener('beforeunload', preventDefaultDialogs);
      window.prompt = originalPrompt;
    };
  }, [showPasswordDialog, passwordError, isPasswordValidated]);

  if (!file || !fileUrl) {
    return null;
  }

  return (
    <div
      className=" fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {showPasswordDialog && (
        <Suspense fallback={null}>
          <LazyPasswordDialog
            onSubmit={handlePasswordSubmit}
            onCancel={handlePasswordCancel}
            error={passwordError}
          />
        </Suspense>
      )}

      {/* Only render Document component if we either have a password or the file is not password protected */}
      {(!isPasswordProtected || password) && (
        <div
          id="pdf-container"
          className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <h3 className="font-montserrat text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate pr-4 flex items-center">
              {isPasswordProtected && (
                <FiLock className="h-4 w-4 mr-2 text-black dark:text-white" />
              )}
              {file.name}
            </h3>

            <div className="flex items-center space-x-2">
              <Button
                variant="icon"
                size="small"
                onClick={downloadPDF}
                tooltip="Download PDF"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <FiDownload className="h-5 w-5" />
              </Button>

              <Button
                variant="icon"
                size="small"
                onClick={toggleFullscreen}
                tooltip={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                {isFullscreen ? (
                  <FiMinimize2 className="h-5 w-5" />
                ) : (
                  <FiMaximize2 className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="icon"
                size="small"
                onClick={onClose}
                tooltip="Close preview"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <FiX className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 flex justify-center bg-zinc-100 dark:bg-zinc-800 overflow-auto">
            {error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6 bg-white dark:bg-zinc-700 rounded-lg shadow">
                  <p className="text-red-600 dark:text-red-400 font-medium font-montserrat mb-2">
                    Error Loading PDF
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono">{error}</p>
                  {error.includes('Password') && (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => setShowPasswordDialog(true)}
                      className="mt-4"
                    >
                      <FiLock className="mr-2" /> Enter Password
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Document
                file={documentFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                className="flex justify-center"
                options={pdfOptions}
                // This will ensure our error handling gets triggered rather than the browser's dialog
                externalLinkTarget="_blank"
                loading={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-pulse text-center">
                      <div className="h-16 w-16 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <FiLoader className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="mt-4 text-zinc-700 dark:text-zinc-300 font-montserrat">
                        Loading PDF...
                      </p>
                    </div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-6 bg-white dark:bg-zinc-700 rounded-lg shadow">
                      <p className="text-red-600 dark:text-red-400 font-medium font-montserrat mb-2">
                        Error Loading PDF
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm font-mono">
                        There was a problem loading the PDF. Please try again.
                      </p>
                      {passwordAttempts > 0 && (
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => {
                            setPasswordError('Incorrect password. Please try again.');
                            setShowPasswordDialog(true);
                          }}
                          className="mt-4"
                        >
                          <FiLock className="mr-2" /> Try Another Password
                        </Button>
                      )}
                    </div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  className="shadow-xl"
                  scale={scale}
                  loading={
                    <div className="h-[800px] w-[600px] bg-zinc-100 dark:bg-zinc-700 animate-pulse rounded shadow-md"></div>
                  }
                  error={
                    <div className="h-[800px] w-[600px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-700 rounded shadow-md">
                      <p className="text-red-500 font-montserrat">
                        Error rendering page {pageNumber}
                      </p>
                    </div>
                  }
                />
              </Document>
            )}
          </div>

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="small"
                onClick={previousPage}
                disabled={pageNavigationState.isFirstPage}
                tooltip={pageNavigationState.isFirstPage ? 'First page' : 'Previous page'}
                className="flex items-center"
              >
                <FiChevronLeft className="mr-1" /> Previous
              </Button>

              <Button
                variant="secondary"
                size="small"
                onClick={nextPage}
                disabled={pageNavigationState.isLastPage}
                tooltip={pageNavigationState.isLastPage ? 'Last page' : 'Next page'}
                className="flex items-center"
              >
                Next <FiChevronRight className="ml-1" />
              </Button>

              <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400 ml-2 whitespace-nowrap">
                Page <span className="font-medium">{pageNavigationState.currentPage}</span> of{' '}
                <span className="font-medium">{pageNavigationState.totalPages}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="icon"
                size="small"
                onClick={zoomOut}
                disabled={scale <= 0.6}
                tooltip="Zoom out"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <FiZoomOut className="h-5 w-5" />
              </Button>

              <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>

              <Button
                variant="icon"
                size="small"
                onClick={zoomIn}
                disabled={scale >= 3.0}
                tooltip="Zoom in"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <FiZoomIn className="h-5 w-5" />
              </Button>

              <Button
                variant="icon"
                size="small"
                onClick={resetZoom}
                className="text-sm font-mono text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                tooltip="Reset zoom"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Show a clearer message when password was canceled */}
      {isPasswordProtected && !password && error && !showPasswordDialog && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
              <FiLock className="h-8 w-8 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            Password Required
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6">{error}</p>
          <div className="flex justify-center space-x-3">
            <Button variant="secondary" size="small" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="small" onClick={() => setShowPasswordDialog(true)}>
              Enter Password
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
