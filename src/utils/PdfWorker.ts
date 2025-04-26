import { pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// We need to create a direct reference to the worker file
// This will be properly handled by Vite during build

// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.mjs';

// Configure options for PDF rendering
export const PDF_OPTIONS = {
  cMapUrl: '',
  cMapPacked: true,
  standardFontDataUrl: '',
  // Optimize rendering performance
  disableAutoFetch: true,
  disableStream: false, // Allow streaming for better performance with large PDFs
  isEvalSupported: false,
  // Enable these options for better performance
  useSystemFonts: false,
  disableFontFace: false,
};
