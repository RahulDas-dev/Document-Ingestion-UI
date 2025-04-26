import { useState, useCallback, memo } from 'react';
import { FileUpload } from './FileUpload';
import { FileList } from './FileList';
import { Button } from './ui/Button';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { PDFPreview } from './PDFPreview';
import {
  FiLoader,
  FiGrid,
  FiList,
  FiFilter,
  FiX,
  FiChevronDown,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import { AppConfig } from '../config/AppConfig';

// Define the FileObject type that combines File and password protection status
interface FileObject {
  file: File;
  isPasswordProtected: boolean;
  savedPassword?: string;
}

// Define proper interface for DocumentHeader props
interface DocumentHeaderProps {
  viewMode: 'grid' | 'list';
  toggleViewMode: (mode: 'grid' | 'list') => void;
  toggleSortDirection: () => void;
  setSortBy: (sortBy: 'name' | 'size' | 'date') => void;
  sortBy: 'name' | 'size' | 'date';
  sortDirection: 'asc' | 'desc';
  hasFiles: boolean;
}

// Memoize the DocumentHeader to prevent unnecessary re-renders
const DocumentHeader = memo(
  ({
    viewMode,
    toggleViewMode,
    toggleSortDirection,
    setSortBy,
    sortBy,
    sortDirection,
    hasFiles,
  }: DocumentHeaderProps) => (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-base font-montserrat font-medium text-zinc-800 dark:text-zinc-100">
        Documents
      </h2>

      {hasFiles && (
        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden flex">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => toggleViewMode('grid')}
              className={`rounded-none ${
                viewMode === 'grid' ? '' : 'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              <FiGrid className="mr-1" /> Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size="small"
              onClick={() => toggleViewMode('list')}
              className={`rounded-none ${
                viewMode === 'list' ? '' : 'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              <FiList className="mr-1" /> List
            </Button>
          </div>

          {/* Sort options dropdown */}
          <div className="relative inline-block group">
            <Button
              variant="secondary"
              size="small"
              className="flex items-center"
              onClick={toggleSortDirection}
            >
              <FiFilter className="mr-1" />
              <span className="mr-1">Sort</span>
              <FiChevronDown className="h-3 w-3" />
              {sortDirection === 'asc' ? (
                <FiArrowUp className="ml-1 h-3 w-3" />
              ) : (
                <FiArrowDown className="ml-1 h-3 w-3" />
              )}
            </Button>
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-700 z-15 hidden group-hover:block">
              <button
                className={`block px-4 py-2 text-sm w-full text-left ${
                  sortBy === 'name'
                    ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
                onClick={() => setSortBy('name')}
              >
                Name
              </button>
              <button
                className={`block px-4 py-2 text-sm w-full text-left ${
                  sortBy === 'size'
                    ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
                onClick={() => setSortBy('size')}
              >
                Size
              </button>
              <button
                className={`block px-4 py-2 text-sm w-full text-left ${
                  sortBy === 'date'
                    ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
                onClick={() => setSortBy('date')}
              >
                Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
);

export const DocumentUpload = () => {
  const [filesObjects, setFilesObjects] = useState<FileObject[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const handleFilesSelected = useCallback(
    (newFiles: File[], newPasswordProtectedFiles?: Map<File, boolean>) => {
      // Check for duplicate files
      const duplicates: string[] = [];
      const filesToAdd: FileObject[] = [];

      newFiles.forEach((newFile) => {
        const isDuplicate = filesObjects.some(
          (existingFileObj) =>
            existingFileObj.file.name === newFile.name && existingFileObj.file.size === newFile.size
        );

        if (isDuplicate) {
          duplicates.push(newFile.name);
        } else {
          const isPasswordProtected = newPasswordProtectedFiles?.get(newFile) || false;
          filesToAdd.push({ file: newFile, isPasswordProtected });
        }
      });

      if (duplicates.length > 0) {
        if (duplicates.length === 1) {
          window.showToast?.warning(`"${duplicates[0]}" has already been added.`);
        } else if (duplicates.length > 1) {
          window.showToast?.warning(`${duplicates.length} duplicate files were not added.`);
        }
      }
      if (filesToAdd.length > 0) {
        setFilesObjects((prevFilesObjects) => [...prevFilesObjects, ...filesToAdd]);
      }
    },
    [filesObjects]
  );

  const handleRemoveFile = useCallback((fileToRemove: File) => {
    setFilesObjects((prevFilesObjects) =>
      prevFilesObjects.filter((fileObj) => fileObj.file !== fileToRemove)
    );
  }, []);

  const handleClearAll = useCallback(() => {
    // Show confirmation dialog instead of clearing immediately
    setShowClearAllDialog(true);
  }, []);

  const confirmClearAll = useCallback(() => {
    setFilesObjects([]);
    setShowClearAllDialog(false);
  }, []);

  const cancelClearAll = useCallback(() => {
    setShowClearAllDialog(false);
  }, []);

  // Add function to save password for a file
  const saveFilePassword = useCallback((file: File, password: string) => {
    setFilesObjects((prevFilesObjects) => {
      return prevFilesObjects.map((fileObj) => {
        if (fileObj.file === file) {
          // Update the password for this file
          return { ...fileObj, savedPassword: password };
        }
        return fileObj;
      });
    });
  }, []);

  const getFilePassword = useCallback(
    (file: File): string | undefined => {
      const fileObj = filesObjects.find((obj) => obj.file === file);
      return fileObj?.savedPassword;
    },
    [filesObjects]
  );

  const handlePreviewFile = useCallback((file: File) => {
    setPreviewFile(file);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewFile(null);
  }, []);

  const handleSubmit = () => {
    if (filesObjects.length === 0) return;

    setIsUploading(true);

    // Here you would actually send the files and passwords to your server
    // Create FormData and append files and passwords
    const formData = new FormData();

    filesObjects.forEach((fileObj, index) => {
      formData.append(`file-${index}`, fileObj.file);

      // If the file has a password, append it
      if (fileObj.isPasswordProtected && fileObj.savedPassword) {
        formData.append(`password-${index}`, fileObj.savedPassword);
      }
    });

    // Simulate upload process with FormData
    console.log('Uploading files with FormData:', formData);

    // In a real implementation, you would send the formData to your API
    // fetch('/api/upload', {
    //   method: 'POST',
    //   body: formData
    // })

    setTimeout(() => {
      setIsUploading(false);
      window.showToast?.success('Files uploaded successfully!');
      // In a real app, you'd likely want to clear files after successful upload
      // setFilesObjects([]);
    }, 2000);
  };

  const isFilePasswordProtected = useCallback(
    (file: File) => {
      const fileObj = filesObjects.find((obj) => obj.file === file);
      return fileObj ? fileObj.isPasswordProtected : false;
    },
    [filesObjects]
  );

  return (
    <>
      <br />
      <br />
      <br />
      <div className="w-full max-w-5xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
        <FileUpload
          onFilesSelected={handleFilesSelected}
          maxFileSize={AppConfig.MAX_UPLOAD_SIZE}
          acceptedFileTypes={AppConfig.ACCEPTED_FILE_TYPES}
        />
        {filesObjects.length > 0 && (
          <>
            <br />
            <DocumentHeader
              viewMode={viewMode}
              toggleViewMode={setViewMode}
              toggleSortDirection={() =>
                setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
              }
              setSortBy={setSortBy}
              sortBy={sortBy}
              sortDirection={sortDirection}
              hasFiles={filesObjects.length > 0}
            />

            <div className="pr-1">
              <FileList
                files={filesObjects.map((fileObj) => fileObj.file)}
                onRemoveFile={handleRemoveFile}
                viewMode={viewMode}
                sortBy={sortBy}
                sortDirection={sortDirection}
                getIsPasswordProtected={isFilePasswordProtected}
                onPreviewFile={handlePreviewFile}
              />
            </div>

            <div className="mt-6 flex justify-end items-center border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <Button
                variant="primary"
                size="small"
                onClick={handleSubmit}
                disabled={isUploading || filesObjects.length === 0}
                className="min-w-[120px] mr-5"
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Uploading...
                  </div>
                ) : (
                  'Upload Files'
                )}
              </Button>
              <Button variant="secondary" size="small" onClick={handleClearAll}>
                <FiX className="mr-1" /> Clear All
              </Button>
            </div>
            <ConfirmDialog
              isOpen={showClearAllDialog}
              onConfirm={confirmClearAll}
              onCancel={cancelClearAll}
              title="Clear All Files"
              description="Are you sure you want to clear all files? "
            />
          </>
        )}

        <PDFPreview
          file={previewFile}
          onClose={handleClosePreview}
          isPasswordProtected={previewFile ? isFilePasswordProtected(previewFile) : false}
          savedPassword={previewFile ? getFilePassword(previewFile) : undefined}
          onPasswordSaved={(password) => previewFile && saveFilePassword(previewFile, password)}
        />
      </div>
    </>
  );
};
