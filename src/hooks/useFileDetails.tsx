import React, { useMemo } from 'react';
import { FiFile, FiFileText } from 'react-icons/fi';
import { FaFilePdf, FaFileWord, FaFileCsv } from 'react-icons/fa';

interface FileDetailsResult {
  icon: (viewMode: 'grid' | 'list') => React.ReactElement;
  fileExtension: string;
  fileSize: string;
  modifiedDate: string;
  canPreview: boolean;
}

/**
 * Custom hook to handle file details and rendering properties with optimized performance
 *
 * @param file The file object to process
 * @returns Object containing file utility functions and properties
 */
export const useFileDetails = (file: File): FileDetailsResult => {
  // Check if file can be previewed - memoize this value
  const canPreview = useMemo(() => file.type === 'application/pdf', [file.type]);

  // Get extension from file name - memoize to prevent recalculation
  const fileExtension = useMemo(() => {
    const parts = file.name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
  }, [file.name]);

  // Format file size with proper units - memoize to prevent recalculation
  const fileSize = useMemo(() => {
    const size = file.size;
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  }, [file.size]);

  // Get formatted date - memoize to prevent recalculation
  const modifiedDate = useMemo(() => {
    const date = new Date(file.lastModified);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [file.lastModified]);

  // Get appropriate icon based on file type
  const getIcon = useMemo(
    () =>
      (viewMode: 'grid' | 'list'): React.ReactElement => {
        const iconProps =
          viewMode === 'grid'
            ? 'transition-all duration-300 group-hover:scale-110 h-8 w-8'
            : 'h-6 w-6';

        if (file.type === 'application/pdf') {
          return <FaFilePdf className={`text-red-500 dark:text-red-400 ${iconProps}`} />;
        } else if (
          file.type === 'application/msword' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ) {
          return <FaFileWord className={`text-blue-500 dark:text-blue-400 ${iconProps}`} />;
        } else if (file.type === 'text/csv') {
          return <FaFileCsv className={`text-green-500 dark:text-green-400 ${iconProps}`} />;
        } else if (file.type === 'text/plain') {
          return <FiFileText className={`text-zinc-600 dark:text-zinc-400 ${iconProps}`} />;
        }

        // Default icon - check for common extensions if mime type is not recognized
        if (fileExtension === 'DOCX' || fileExtension === 'DOC') {
          return <FaFileWord className={`text-blue-500 dark:text-blue-400 ${iconProps}`} />;
        } else if (fileExtension === 'CSV') {
          return <FaFileCsv className={`text-green-500 dark:text-green-400 ${iconProps}`} />;
        } else if (fileExtension === 'PDF') {
          return <FaFilePdf className={`text-red-500 dark:text-red-400 ${iconProps}`} />;
        } else if (fileExtension === 'TXT') {
          return <FiFileText className={`text-zinc-600 dark:text-zinc-400 ${iconProps}`} />;
        }

        // Default fallback icon
        return <FiFile className={`text-zinc-500 dark:text-zinc-400 ${iconProps}`} />;
      },
    [file.type, fileExtension]
  );

  return {
    icon: getIcon,
    fileExtension,
    fileSize,
    modifiedDate,
    canPreview,
  };
};
