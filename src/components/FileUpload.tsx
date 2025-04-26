import React, { useState, useRef, useCallback, memo } from 'react';
import { Button } from './ui/Button';
import { FiUploadCloud, FiFile, FiImage, FiFileText, FiLock } from 'react-icons/fi';
import { AppConfig, AcceptedFileType } from '../config/AppConfig';
import { isPdfPasswordProtected } from '../utils/PdfUtils';

interface FileUploadProps {
  onFilesSelected: (files: File[], passwordProtectedFiles?: Map<File, boolean>) => void;
  maxFileSize?: number; // in
  acceptedFileTypes?: AcceptedFileType[];
}

export const FileUpload = memo(
  ({
    onFilesSelected,
    maxFileSize = AppConfig.MAX_UPLOAD_SIZE,
    acceptedFileTypes = AppConfig.ACCEPTED_FILE_TYPES,
  }: FileUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFiles = useCallback(
      async (
        files: File[]
      ): Promise<{
        validFiles: File[];
        passwordProtectedFiles: Map<File, boolean>;
        errors: string[];
      }> => {
        const validFiles: File[] = [];
        const passwordProtectedFiles = new Map<File, boolean>();
        const errors: string[] = [];
        const pdfPasswordChecks: Promise<void>[] = [];

        // First do basic validation (size and type)
        for (const file of files) {
          // Validate file size
          if (file.size > maxFileSize * 1024 * 1024) {
            errors.push(`File "${file.name}" exceeds the maximum size of ${maxFileSize}MB`);
            continue;
          }

          // Validate file type
          if (!acceptedFileTypes.includes(file.type as AcceptedFileType)) {
            errors.push(`File "${file.name}" has an unsupported format`);
            continue;
          }

          // For PDF files, check if they are password protected
          if (file.type === 'application/pdf') {
            pdfPasswordChecks.push(
              isPdfPasswordProtected(file)
                .then((isPasswordProtected) => {
                  // Store whether the file is password protected
                  passwordProtectedFiles.set(file, isPasswordProtected);
                  // Add to valid files either way
                  validFiles.push(file);

                  // Add a notification if the file is password protected
                  if (isPasswordProtected) {
                    window.showToast?.info(
                      `File "${file.name}" is password protected. You'll be prompted for the password when viewing.`,
                      5000
                    );
                  }
                })
                .catch((error) => {
                  console.error('Error checking PDF password protection:', error);
                  errors.push(`Error validating file "${file.name}". Please try again.`);
                })
            );
          } else {
            // Non-PDF files are valid if they passed the basic checks
            validFiles.push(file);
          }
        }

        // Wait for all PDF password checks to complete
        if (pdfPasswordChecks.length > 0) {
          await Promise.all(pdfPasswordChecks);
        }

        return { validFiles, passwordProtectedFiles, errors };
      },
      [maxFileSize, acceptedFileTypes]
    );

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setIsValidating(true);

      try {
        const { validFiles, passwordProtectedFiles, errors } = await validateFiles(
          Array.from(files)
        );

        // Show error toasts for each error
        errors.forEach((error) => {
          window.showToast?.error(error, 5000);
        });

        if (validFiles.length > 0) {
          onFilesSelected(validFiles, passwordProtectedFiles);
        }
      } finally {
        setIsValidating(false);

        // Reset the input so the same file can be uploaded again if needed
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    const handleDrop = useCallback(
      async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        const files = event.dataTransfer.files;
        if (!files || files.length === 0) return;

        setIsValidating(true);

        try {
          const { validFiles, passwordProtectedFiles, errors } = await validateFiles(
            Array.from(files)
          );

          // Show error toasts for each error
          errors.forEach((error) => {
            window.showToast?.error(error, 5000);
          });

          if (validFiles.length > 0) {
            onFilesSelected(validFiles, passwordProtectedFiles);
          }
        } finally {
          setIsValidating(false);
        }
      },
      [onFilesSelected, validateFiles]
    );

    const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
      setIsDragging(false);
    }, []);

    const handleButtonClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    return (
      <div className="w-full">
        <div
          className={`border-2 border-dashed rounded-lg transition-all duration-300 ${
            isDragging
              ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20 scale-[1.02]'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
          } text-center cursor-pointer`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleButtonClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
            accept={acceptedFileTypes.join(',')}
          />
          <div className="flex flex-col items-center justify-center gap-4 py-10 px-4">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-full">
              <FiUploadCloud className="h-10 w-10 text-blue-500 dark:text-blue-400" />
            </div>

            <div>
              <div className="text-lg font-montserrat font-medium text-zinc-800 dark:text-zinc-200">
                {isDragging ? 'Drop files to upload' : 'Drag and drop files here'}
              </div>
              <div className="text-sm font-mono text-zinc-500 dark:text-zinc-400 mt-1">or</div>
            </div>

            <Button variant="primary" size="small" className="mt-2" disabled={isValidating}>
              {isValidating ? 'Validating files...' : 'Browse Files'}
            </Button>

            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {acceptedFileTypes.map((type) => (
                <div
                  key={type}
                  className="flex items-center text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/40 px-2 py-1 rounded-full"
                >
                  {type.includes('pdf') && <FiFile className="mr-1" />}
                  {type.includes('image') && <FiImage className="mr-1" />}
                  {type.includes('text') && <FiFileText className="mr-1" />}

                  {AppConfig.FILE_TYPE_LABELS[type]}
                </div>
              ))}
            </div>

            <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
              <span>Maximum file size: {maxFileSize}MB</span>
              <span className="h-1 w-1 bg-zinc-400 dark:bg-zinc-600 rounded-full"></span>
              <span className="flex items-center">
                <FiLock className="mr-1 h-3 w-3" /> Password-protected PDFs supported
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
