import React, { useState, memo, useCallback, useMemo } from 'react';
import { FiTrash2, FiEye, FiClock, FiMaximize2, FiLock } from 'react-icons/fi';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { useFileDetails } from '../hooks/useFileDetails';

interface FileItemProps {
  file: File;
  onRemove: (file: File) => void;
  viewMode: 'grid' | 'list';
  isPasswordProtected: boolean;
  onPreviewFile?: (file: File) => void; // Make callback optional
}

export const FileItem: React.FC<FileItemProps> = memo(
  ({ file, onRemove, viewMode, isPasswordProtected, onPreviewFile }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { icon, fileExtension, fileSize, modifiedDate, canPreview } = useFileDetails(file);
    const handlePreviewClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onPreviewFile && canPreview) {
          onPreviewFile(file);
        }
      },
      [file, onPreviewFile, canPreview]
    );

    const handleRemoveClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setShowConfirmDialog(true);
    }, []);

    const handleConfirmRemove = useCallback(() => {
      onRemove(file);
      setShowConfirmDialog(false);
    }, [file, onRemove]);

    const handleCancelRemove = useCallback(() => {
      setShowConfirmDialog(false);
    }, []);

    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
    }, []);

    if (viewMode === 'list') {
      return (
        <>
          <div
            className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700 p-4 mb-2 transition-all duration-200 hover:shadow-md flex items-center group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex-shrink-0 mr-4">{icon(viewMode)}</div>

            <div className="flex-grow min-w-0">
              <div className="flex items-center">
                <p className="font-montserrat font-medium text-sm text-zinc-800 dark:text-zinc-200 truncate mr-2">
                  {file.name}
                </p>
                <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-sm flex-shrink-0">
                  {fileSize}
                </span>
                {isPasswordProtected && (
                  <span className="ml-2 text-xs font-mono bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 rounded-sm flex items-center flex-shrink-0">
                    <FiLock className="mr-1 h-3 w-3" /> Protected
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1 flex items-center">
                <FiClock className="mr-1" /> Modified {modifiedDate}
              </div>
            </div>

            <div className="flex-shrink-0 flex items-center space-x-2">
              {canPreview && (
                <Button
                  variant="icon"
                  size="small"
                  onClick={handlePreviewClick}
                  className={`text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 ${!isHovered && !canPreview ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                >
                  <FiEye className="mr-1 h-5 w-5" />
                </Button>
              )}

              <Button
                variant="icon"
                size="small"
                onClick={handleRemoveClick}
                className={`text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 ${!isHovered && !canPreview ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
              >
                <FiTrash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Confirmation Dialog */}
          {showConfirmDialog && (
            <ConfirmDialog
              title="Continue to iterate?"
              description={
                <>
                  Are you sure you want to remove{' '}
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{file.name}</span>?
                </>
              }
              onCancel={handleCancelRemove}
              onConfirm={handleConfirmRemove}
            />
          )}
        </>
      );
    }

    // Enhanced grid view
    return (
      <>
        <div
          className="group bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg border border-zinc-100 dark:border-zinc-700 h-full flex flex-col relative cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={canPreview && onPreviewFile ? handlePreviewClick : undefined}
        >
          {/* File type badge at top right */}
          <div className="absolute top-2 right-2 z-10">
            <span className="text-xs font-mono px-2 py-1 rounded-sm font-medium bg-zinc-200 dark:bg-zinc-600 text-zinc-700 dark:text-zinc-300">
              {fileExtension}
            </span>
          </div>

          {/* Password protected badge at top left */}
          {isPasswordProtected && (
            <div className="absolute top-2 left-2 z-10">
              <span className="text-xs font-mono px-2 py-1 rounded-sm font-medium bg-zinc-200 text-zinc-700 dark:bg-zinc-600 dark:text-zinc-300 flex items-center">
                <FiLock className="mr-1 h-3 w-3" /> Protected
              </span>
            </div>
          )}

          <div className="relative flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 p-6 flex-grow">
            <div className="transform transition-transform duration-300 group-hover:scale-110 flex items-center justify-center h-20">
              {icon(viewMode)}
            </div>

            {/* Hover overlay with actions */}
            <div
              className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} z-10`}
            >
              {canPreview ? (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handlePreviewClick}
                  className="bg-white/90 hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800 transform transition-transform duration-300 hover:scale-105"
                >
                  <FiMaximize2 className="mr-1" /> Preview
                </Button>
              ) : (
                <span className="text-white text-xs font-mono px-3 py-1 bg-zinc-800/80 rounded-sm">
                  Preview not available
                </span>
              )}
            </div>
          </div>

          <div
            className="p-4 bg-white dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded-sm flex-shrink-0 bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {fileSize}
              </span>

              <Button
                variant="icon"
                size="small"
                onClick={handleRemoveClick}
                className="text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors duration-200"
              >
                <FiTrash2 className="h-4 w-4" />
              </Button>
            </div>

            <p className="font-montserrat font-medium text-sm text-zinc-800 dark:text-zinc-200 truncate">
              {file.name}
            </p>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center">
              <FiClock className="mr-1 h-3 w-3" /> {modifiedDate}
            </p>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <ConfirmDialog
            title="Are you sure you want to Remove"
            description={
              <>
                <span className="font-montserrat text-zinc-800 dark:text-zinc-200">
                  {file.name}
                </span>
                ?
              </>
            }
            onCancel={handleCancelRemove}
            onConfirm={handleConfirmRemove}
          />
        )}
      </>
    );
  }
);

interface FileListProps {
  files: File[];
  onRemoveFile: (file: File) => void;
  viewMode?: 'grid' | 'list';
  sortBy?: 'name' | 'size' | 'date';
  sortDirection?: 'asc' | 'desc';
  getIsPasswordProtected?: (file: File) => boolean;
  onPreviewFile?: (file: File) => void; // Add preview callback
}

export const FileList: React.FC<FileListProps> = ({
  files,
  onRemoveFile,
  viewMode = 'grid',
  sortBy = 'name',
  sortDirection = 'asc',
  getIsPasswordProtected = () => false,
  onPreviewFile,
}) => {
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      if (sortBy === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'size') {
        return sortDirection === 'asc' ? a.size - b.size : b.size - a.size;
      } else if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? a.lastModified - b.lastModified
          : b.lastModified - a.lastModified;
      }
      return a.name.localeCompare(b.name);
    });
  }, [files, sortBy, sortDirection]);

  if (files.length === 0) {
    return (
      <div className="py-8 text-center bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-700">
        <p className="text-zinc-500 dark:text-zinc-400 font-montserrat">No files selected</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto custom-scrollbar">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
          {sortedFiles.map((file, index) => (
            <FileItem
              key={`${file.name}-${file.lastModified}-${index}`}
              file={file}
              onRemove={onRemoveFile}
              viewMode={viewMode}
              isPasswordProtected={getIsPasswordProtected(file)}
              onPreviewFile={onPreviewFile}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2 pb-4">
          {sortedFiles.map((file, index) => (
            <FileItem
              key={`${file.name}-${file.lastModified}-${index}`}
              file={file}
              onRemove={onRemoveFile}
              viewMode={viewMode}
              isPasswordProtected={getIsPasswordProtected(file)}
              onPreviewFile={onPreviewFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};
