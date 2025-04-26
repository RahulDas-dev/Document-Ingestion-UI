/**
 * Utility for working with PDF files
 * Uses react-pdf which is built on top of pdfjs-dist
 */
import { pdfjs } from 'react-pdf';

// Configure the worker for PDF.js

/**
 * Checks if a PDF file is password protected
 * @param file PDF file to check
 * @returns Promise<boolean> true if password protected, false otherwise
 */
export async function isPdfPasswordProtected(file: File): Promise<boolean> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document using PDF.js (from react-pdf)
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });

    // Try to load the document
    try {
      await loadingTask.promise;
      // If we get here, the PDF is not password protected
      return false;
    } catch (error: unknown) {
      // Check if the error is related to password protection
      if (
        error instanceof Error &&
        (error.name === 'PasswordException' ||
          error.message.includes('password') ||
          error.message.includes('Password'))
      ) {
        return true;
      }
      // Some other error occurred
      throw error;
    }
  } catch (error) {
    console.error('Error checking if PDF is password protected:', error);
    // In case of any other error, we'll assume it's not a password issue
    return false;
  }
}

/**
 * Try to open a PDF with a password
 * @param file The PDF file
 * @param password The password to try
 * @returns Promise<boolean> true if successful, false if wrong password
 */
export async function tryOpenPdfWithPassword(file: File, password: string): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      password: password,
    });

    await loadingTask.promise;
    return true; // Password worked
  } catch (error) {
    console.error('Error opening PDF with password:', error);
    return false; // Password didn't work
  }
}
