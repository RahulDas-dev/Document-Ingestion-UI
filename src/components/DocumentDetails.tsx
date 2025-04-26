import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from './ui/Button';
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFileText,
  FiChevronDown,
  FiSearch,
  FiPackage,
  FiCalendar,
  FiFolder,
  FiFilter,
  FiArrowUp,
  FiArrowDown,
  FiX,
} from 'react-icons/fi';

// Processing stages
type ProcessingStage = 'uploaded' | 'analyzing' | 'extraction' | 'review' | 'completed';

interface ProcessingStageInfo {
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const processingStages: Record<ProcessingStage, ProcessingStageInfo> = {
  uploaded: {
    label: 'Uploaded',
    icon: <FiFileText className="w-5 h-5" />,
    description: 'Document has been uploaded successfully',
    color: 'text-blue-500',
  },
  analyzing: {
    label: 'Analyzing',
    icon: <FiClock className="w-5 h-5 animate-pulse" />,
    description: 'Document is being analyzed for content structure',
    color: 'text-yellow-500',
  },
  extraction: {
    label: 'Data Extraction',
    icon: <FiClock className="w-5 h-5 animate-pulse" />,
    description: 'Extracting key information from document',
    color: 'text-yellow-500',
  },
  review: {
    label: 'Review',
    icon: <FiAlertCircle className="w-5 h-5" />,
    description: 'Document needs review for accuracy',
    color: 'text-orange-500',
  },
  completed: {
    label: 'Completed',
    icon: <FiCheckCircle className="w-5 h-5" />,
    description: 'Document processing completed successfully',
    color: 'text-green-500',
  },
};

// Mock document file data
interface DocumentFile {
  id: string;
  filename: string;
  fileSize: string;
  uploadDate: string;
  pageCount: number;
  currentStage: ProcessingStage;
}

// Mock document upload (batch) data
interface DocumentUploadBatch {
  id: string;
  uploadDate: string;
  files: DocumentFile[];
  totalFiles: number;
  completedFiles: number;
}

// Define interface for DocumentHeader props
interface DocumentHeaderProps {
  toggleFilter: () => void;
  showFilter: boolean;
  toggleSortDirection: () => void;
  setSortBy: (sortBy: 'name' | 'size' | 'date' | 'status') => void;
  sortBy: 'name' | 'size' | 'date' | 'status';
  sortDirection: 'asc' | 'desc';
  hasFiles: boolean;
}

// DocumentHeader component for filter and sort controls
const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  toggleFilter,
  showFilter,
  toggleSortDirection,
  setSortBy,
  sortBy,
  sortDirection,
  hasFiles,
}) => (
  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
    <h2 className="text-sm font-montserrat font-medium text-zinc-800 dark:text-zinc-100">
      Document Uploads
    </h2>

    {hasFiles && (
      <div className="flex flex-wrap items-center gap-2">
        {/* Search/Filter toggle button */}
        <Button
          variant={showFilter ? 'primary' : 'secondary'}
          size="small"
          onClick={toggleFilter}
          className="flex items-center text-xs py-1 px-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200"
        >
          <FiSearch className="mr-1 h-3 w-3" />
          Filter
        </Button>

        {/* Sort options dropdown */}
        <div className="relative inline-block group">
          <Button
            variant="secondary"
            size="small"
            className="flex items-center text-xs py-1 px-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200"
            onClick={toggleSortDirection}
          >
            <FiFilter className="mr-1 h-3 w-3" />
            <span className="mr-1">Sort</span>
            {sortDirection === 'asc' ? (
              <FiArrowUp className="h-3 w-3" />
            ) : (
              <FiArrowDown className="h-3 w-3" />
            )}
          </Button>
          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-700 z-10 hidden group-hover:block animate-fade-in">
            <button
              className={`block px-3 py-1.5 text-xs w-full text-left ${
                sortBy === 'name'
                  ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
              } transition-colors duration-200`}
              onClick={() => setSortBy('name')}
            >
              Name
            </button>
            <button
              className={`block px-3 py-1.5 text-xs w-full text-left ${
                sortBy === 'size'
                  ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
              } transition-colors duration-200`}
              onClick={() => setSortBy('size')}
            >
              Size
            </button>
            <button
              className={`block px-3 py-1.5 text-xs w-full text-left ${
                sortBy === 'date'
                  ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
              } transition-colors duration-200`}
              onClick={() => setSortBy('date')}
            >
              Date
            </button>
            <button
              className={`block px-3 py-1.5 text-xs w-full text-left ${
                sortBy === 'status'
                  ? 'bg-zinc-100 dark:bg-zinc-700 font-medium'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
              } transition-colors duration-200`}
              onClick={() => setSortBy('status')}
            >
              Status
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export const DocumentDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUploads, setExpandedUploads] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // If an ID is provided, expand that upload by default
  useEffect(() => {
    if (id) {
      // Find which upload batch contains the document with this ID
      const uploadId = documentUploads.find((upload) =>
        upload.files.some((file) => file.id === id)
      )?.id;

      if (uploadId && !expandedUploads.includes(uploadId)) {
        setExpandedUploads((prev) => [...prev, uploadId]);
      }
    }
  }, [id]);

  // Mock data for multiple document uploads, each containing multiple files
  // In a real app, you would fetch this from your API
  const documentUploads: DocumentUploadBatch[] = [
    {
      id: '1',
      uploadDate: 'April 26, 2025 10:15 AM',
      totalFiles: 3,
      completedFiles: 1,
      files: [
        {
          id: '1-1',
          filename: 'Invoice-2023-04-26.pdf',
          fileSize: '1.2 MB',
          uploadDate: 'April 26, 2025 10:15 AM',
          pageCount: 3,
          currentStage: 'completed',
        },
        {
          id: '1-2',
          filename: 'Contract-2023-04-26.pdf',
          fileSize: '2.4 MB',
          uploadDate: 'April 26, 2025 10:15 AM',
          pageCount: 8,
          currentStage: 'review',
        },
        {
          id: '1-3',
          filename: 'Specifications-2023-04-26.docx',
          fileSize: '0.8 MB',
          uploadDate: 'April 26, 2025 10:15 AM',
          pageCount: 5,
          currentStage: 'extraction',
        },
      ],
    },
    {
      id: '2',
      uploadDate: 'April 25, 2025 3:30 PM',
      totalFiles: 2,
      completedFiles: 2,
      files: [
        {
          id: '2-1',
          filename: 'Report-Q1-2025.pdf',
          fileSize: '3.1 MB',
          uploadDate: 'April 25, 2025 3:30 PM',
          pageCount: 15,
          currentStage: 'completed',
        },
        {
          id: '2-2',
          filename: 'Financial-Statement-Q1-2025.xlsx',
          fileSize: '0.5 MB',
          uploadDate: 'April 25, 2025 3:30 PM',
          pageCount: 4,
          currentStage: 'completed',
        },
      ],
    },
    {
      id: '3',
      uploadDate: 'April 24, 2025 9:45 AM',
      totalFiles: 4,
      completedFiles: 2,
      files: [
        {
          id: '3-1',
          filename: 'Employee-Handbook-2025.pdf',
          fileSize: '4.2 MB',
          uploadDate: 'April 24, 2025 9:45 AM',
          pageCount: 32,
          currentStage: 'completed',
        },
        {
          id: '3-2',
          filename: 'Training-Manual-2025.pdf',
          fileSize: '5.7 MB',
          uploadDate: 'April 24, 2025 9:45 AM',
          pageCount: 47,
          currentStage: 'completed',
        },
        {
          id: '3-3',
          filename: 'Legal-Compliance-2025.pdf',
          fileSize: '1.8 MB',
          uploadDate: 'April 24, 2025 9:45 AM',
          pageCount: 12,
          currentStage: 'analyzing',
        },
        {
          id: '3-4',
          filename: 'HR-Policies-2025.docx',
          fileSize: '1.1 MB',
          uploadDate: 'April 24, 2025 9:45 AM',
          pageCount: 9,
          currentStage: 'extraction',
        },
      ],
    },
  ];

  // Function to toggle upload expansion
  const toggleUploadExpansion = (uploadId: string) => {
    // Using the functional state update pattern to ensure
    // we're working with the most current state
    setExpandedUploads((prevState) => {
      // Check if the ID is already in the expanded list
      const isExpanded = prevState.includes(uploadId);

      // If expanded, remove it; otherwise, add it
      return isExpanded ? prevState.filter((id) => id !== uploadId) : [...prevState, uploadId];
    });
  };

  // Filter uploads and files based on search query
  const filteredUploads = documentUploads
    .map((upload) => {
      // First filter files by search query
      const filteredFiles = upload.files.filter((file) =>
        file.filename.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Sort the filtered files
      const sortedFiles = [...filteredFiles].sort((a, b) => {
        // Sort by appropriate field
        let comparison = 0;

        if (sortBy === 'name') {
          comparison = a.filename.localeCompare(b.filename);
        } else if (sortBy === 'size') {
          // Extract numeric value from size string (e.g., "1.2 MB" -> 1.2)
          const sizeA = parseFloat(a.fileSize);
          const sizeB = parseFloat(b.fileSize);
          comparison = sizeA - sizeB;
        } else if (sortBy === 'date') {
          const dateA = new Date(a.uploadDate).getTime();
          const dateB = new Date(b.uploadDate).getTime();
          comparison = dateA - dateB;
        } else if (sortBy === 'status') {
          // Define an order for statuses for sorting
          const statusOrder = {
            completed: 1,
            review: 2,
            extraction: 3,
            analyzing: 4,
            uploaded: 5,
          };

          const statusA = statusOrder[a.currentStage] || 999;
          const statusB = statusOrder[b.currentStage] || 999;
          comparison = statusA - statusB;
        }

        // Apply sort direction
        return sortDirection === 'asc' ? comparison : -comparison;
      });

      return {
        ...upload,
        files: sortedFiles,
      };
    })
    .filter((upload) => upload.files.length > 0);

  // Function to toggle filter visibility
  const toggleFilter = () => {
    setShowFilter((prev) => !prev);
  };

  // Function to toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Get file extension
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  // Render file icon based on file extension
  const renderFileIcon = (filename: string) => {
    const extension = getFileExtension(filename);

    // Map extensions to styled icons - neutral colors only
    const extensionColors = {
      PDF: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
      DOCX: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
      XLSX: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
      PPTX: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
      TXT: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    };

    const bgColor =
      extensionColors[extension as keyof typeof extensionColors] ||
      'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';

    return (
      <div
        className={`w-6 h-6 flex items-center justify-center rounded-md shadow-sm ${bgColor} font-mono`}
      >
        <span className="text-xs font-medium">{extension}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full px-4 sm:px-6 lg:px-8 animate-fade-in">
      <header className="pb-4 border-b border-zinc-200 dark:border-zinc-700 mb-4">
        <Button
          variant="ghost"
          size="small"
          onClick={() => navigate(-1)}
          className="mb-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 -ml-2"
        >
          <FiArrowLeft className="mr-1" /> Back
        </Button>
        <h1 className="text-2xl font-semibold gradient-text flex items-center">
          <FiFileText className="mr-2 text-zinc-500" />
          Document Details
        </h1>
      </header>

      {/* Document list section */}
      <div className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm rounded-xl shadow-sm border border-zinc-200/50 dark:border-zinc-700/50 p-4 sm:p-6">
        {/* Header with back button */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate('/')}
              className="mr-3 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200"
            >
              <FiArrowLeft className="mr-1.5" /> Back
            </Button>
            <h1 className="text-base font-montserrat font-medium text-zinc-800 dark:text-zinc-100 flex items-center">
              <FiPackage className="mr-1.5 text-zinc-600 dark:text-zinc-400" />
              Document Processing
            </h1>
          </div>

          {/* Search bar */}
          <div className="relative w-56">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 pr-8 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 transition-all duration-200 text-sm"
            />
            <FiSearch className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-zinc-400 h-3.5 w-3.5" />
          </div>
        </div>

        {/* Document Uploads List with filter and sort controls */}
        <div>
          <DocumentHeader
            toggleFilter={toggleFilter}
            showFilter={showFilter}
            toggleSortDirection={toggleSortDirection}
            setSortBy={setSortBy}
            sortBy={sortBy}
            sortDirection={sortDirection}
            hasFiles={documentUploads.length > 0}
          />

          {showFilter && (
            <div className="mb-4 animate-fade-in">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter files by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 transition-all duration-200 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors duration-200"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {filteredUploads.length === 0 ? (
            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg text-center">
              <p className="text-zinc-500 dark:text-zinc-400 font-montserrat text-sm">
                No documents found matching your search criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUploads.map((upload) => (
                <div
                  key={upload.id}
                  className="bg-zinc-50 dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow transition-all duration-300"
                >
                  {/* Upload header (always visible) */}
                  <div
                    className={`p-3 flex items-center justify-between cursor-pointer transition-all duration-200 ${expandedUploads.includes(upload.id) ? 'bg-zinc-100/50 dark:bg-zinc-700/30' : 'hover:bg-zinc-100/50 dark:hover:bg-zinc-700/30'}`}
                    onClick={() => toggleUploadExpansion(upload.id)}
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center">
                        <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-md flex items-center justify-center mr-3 shadow-sm">
                          <FiFolder className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                        </div>
                        <div>
                          <h3 className="font-montserrat font-medium text-sm text-zinc-800 dark:text-zinc-100">
                            Upload Batch #{upload.id}
                          </h3>
                          <div className="flex items-center mt-0.5">
                            <span className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs rounded-full font-mono shadow-sm">
                              {upload.files.length} {upload.files.length === 1 ? 'file' : 'files'}
                            </span>
                            <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono flex items-center">
                              <FiCalendar className="mr-1 h-3 w-3" /> {upload.uploadDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 overflow-hidden shadow-inner">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500 ease-in-out bg-zinc-500 dark:bg-zinc-400"
                            style={{
                              width: `${(upload.completedFiles / upload.totalFiles) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-mono flex justify-between">
                          <span>
                            {upload.completedFiles} of {upload.totalFiles} files processed
                          </span>
                          <span>
                            {Math.round((upload.completedFiles / upload.totalFiles) * 100)}%
                            complete
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`p-2 rounded-full shadow-sm transition-all duration-200 ${
                        expandedUploads.includes(upload.id)
                          ? 'bg-zinc-300 dark:bg-zinc-600 rotate-180'
                          : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                      }`}
                    >
                      <FiChevronDown className="text-zinc-600 dark:text-zinc-300 h-4 w-4" />
                    </div>
                  </div>

                  {/* Expanded file list - Only render when the upload is expanded */}
                  {expandedUploads.includes(upload.id) && (
                    <div className="border-t border-zinc-200 dark:border-zinc-700 animate-fadeIn">
                      <div className="p-2 bg-zinc-50/50 dark:bg-zinc-800/50">
                        {upload.files.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center p-1 bg-white dark:bg-zinc-900 rounded-md shadow-sm border border-zinc-100 dark:border-zinc-700/50 transition-all duration-200 mt-1.5 first:mt-0 hover:shadow group"
                          >
                            <div className="mr-2 flex-shrink-0 transform transition-transform duration-200 group-hover:scale-105">
                              {renderFileIcon(file.filename)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <p className="font-montserrat text-[11px] truncate mr-1.5 text-zinc-800 dark:text-zinc-200">
                                  {file.filename}
                                </p>
                                <span className="px-1.5 py-0.5 text-[9px] font-mono bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-sm shadow-sm">
                                  {file.fileSize}
                                </span>
                              </div>
                              <div className="flex items-center mt-0.5">
                                <div className="mr-1.5 text-zinc-500 dark:text-zinc-400 scale-90">
                                  {processingStages[file.currentStage].icon}
                                </div>
                                <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">
                                  {processingStages[file.currentStage].label}
                                </span>
                                <span className="mx-1.5 text-zinc-300 dark:text-zinc-600 text-[9px]">
                                  •
                                </span>
                                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">
                                  {file.pageCount} {file.pageCount === 1 ? 'page' : 'pages'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-2">
                              <Button
                                variant="secondary"
                                size="small"
                                onClick={() => navigate(`/document/${file.id}`)}
                                className="py-0.5 px-2 text-[10px]"
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
