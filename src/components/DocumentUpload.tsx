import { useState, useCallback, useMemo, memo } from 'react';
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
  FiSearch,
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
  handleClearAll: () => void;
  toggleSortDirection: () => void;
  setSortBy: (sortBy: 'name' | 'size' | 'date') => void;
  sortBy: 'name' | 'size' | 'date';
  sortDirection: 'asc' | 'desc';
  hasFiles: boolean;
  toggleFilter: () => void;
  showFilter: boolean;
}

// Memoize the DocumentHeader to prevent unnecessary re-renders
const DocumentHeader = memo(
  ({
    viewMode,
    toggleViewMode,
    handleClearAll,
    toggleSortDirection,
    setSortBy,
    sortBy,
    sortDirection,
    hasFiles,
    toggleFilter,
    showFilter,
  }: DocumentHeaderProps) => (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-montserrat font-semibold text-zinc-800 dark:text-zinc-100">
        Document Files
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

          {/* Search/Filter toggle button */}
          <Button
            variant={showFilter ? 'primary' : 'secondary'}
            size="small"
            onClick={toggleFilter}
            className="flex items-center"
          >
            <FiSearch className="mr-1" />
            Filter
          </Button>

          {/* Sort options dropdown */}
          <div className="relative inline-block group">
            <Button
              variant="secondary"
              size="small"
              className="flex items-center"
              onClick={toggleSortDirection}
            >
              <FiFilter className="mr-1" />
              <span className="mr-1">Sort by</span>
              <FiChevronDown className="h-3 w-3" />
              {sortDirection === 'asc' ? (
                <FiArrowUp className="ml-1 h-3 w-3" />
              ) : (
                <FiArrowDown className="ml-1 h-3 w-3" />
              )}
            </Button>
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-700 z-10 hidden group-hover:block">
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

          {/* Clear all button */}
          <Button variant="secondary" size="small" onClick={handleClearAll}>
            <FiX className="mr-1" /> Clear All
          </Button>
        </div>
      )}
    </div>
  )
);

export const DocumentUpload = () => {
  const [filesObjects, setFilesObjects] = useState<FileObject[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterQuery, setFilterQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
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
        // Check if a file with the same name and size already exists
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

      // Show toast notification for duplicates
      if (duplicates.length > 0) {
        if (duplicates.length === 1) {
          window.showToast?.warning(`"${duplicates[0]}" has already been added.`);
        } else if (duplicates.length > 1) {
          window.showToast?.warning(`${duplicates.length} duplicate files were not added.`);
        }
      }

      // Only add non-duplicate files
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
    setFilterQuery('');
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

  // Get the password for a file if available
  const getFilePassword = useCallback(
    (file: File): string | undefined => {
      const fileObj = filesObjects.find((obj) => obj.file === file);
      return fileObj?.savedPassword;
    },
    [filesObjects]
  );

  // Handle preview for a file
  const handlePreviewFile = useCallback((file: File) => {
    setPreviewFile(file);
  }, []);

  // Close preview
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

  // Memoize filtered files to avoid recalculation on every render
  const filteredFilesObjects = useMemo(() => {
    return filterQuery
      ? filesObjects.filter((fileObj) =>
          fileObj.file.name.toLowerCase().includes(filterQuery.toLowerCase())
        )
      : filesObjects;
  }, [filesObjects, filterQuery]);

  // Memoize filtered files (just the File objects)
  const filteredFiles = useMemo(
    () => filteredFilesObjects.map((fileObj) => fileObj.file),
    [filteredFilesObjects]
  );

  // Check if a file is password protected
  const isFilePasswordProtected = useCallback(
    (file: File) => {
      const fileObj = filesObjects.find((obj) => obj.file === file);
      return fileObj ? fileObj.isPasswordProtected : false;
    },
    [filesObjects]
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-sm">
      <FileUpload
        onFilesSelected={handleFilesSelected}
        maxFileSize={AppConfig.MAX_UPLOAD_SIZE}
        acceptedFileTypes={AppConfig.ACCEPTED_FILE_TYPES}
      />

      {filesObjects.length > 0 && (
        <>
          <DocumentHeader
            viewMode={viewMode}
            toggleViewMode={setViewMode}
            handleClearAll={handleClearAll}
            toggleSortDirection={() =>
              setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
            }
            setSortBy={setSortBy}
            sortBy={sortBy}
            sortDirection={sortDirection}
            hasFiles={filesObjects.length > 0}
            toggleFilter={() => setShowFilter((prev) => !prev)}
            showFilter={showFilter}
          />

          {showFilter && (
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter files by name..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
                {filterQuery && (
                  <button
                    onClick={() => setFilterQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Using a more adaptive container for the file list */}
          <div className="pr-1">
            <FileList
              files={filteredFiles}
              onRemoveFile={handleRemoveFile}
              viewMode={viewMode}
              sortBy={sortBy}
              sortDirection={sortDirection}
              getIsPasswordProtected={isFilePasswordProtected}
              onPreviewFile={handlePreviewFile}
            />
          </div>

          <div className="mt-6 flex justify-between items-center border-t border-zinc-200 dark:border-zinc-700 pt-4">
            <Button
              variant="primary"
              size="small"
              onClick={handleSubmit}
              disabled={isUploading || filesObjects.length === 0}
              className="min-w-[120px]"
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
          </div>

          {/* Confirmation dialog for clearing all files */}
          <ConfirmDialog
            isOpen={showClearAllDialog}
            onConfirm={confirmClearAll}
            onCancel={cancelClearAll}
            title="Clear All Files"
            description="Are you sure you want to clear all files? This action cannot be undone."
          />
        </>
      )}

      {/* PDF Preview with password handling */}
      {previewFile && (
        <PDFPreview
          file={previewFile}
          onClose={handleClosePreview}
          isPasswordProtected={isFilePasswordProtected(previewFile)}
          savedPassword={getFilePassword(previewFile)}
          onPasswordSaved={(password) => saveFilePassword(previewFile, password)}
        />
      )}
    </div>
  );
};
