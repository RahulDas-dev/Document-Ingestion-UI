export type AcceptedFileType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'text/plain'
  | 'text/csv'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export class AppConfig {
  static readonly ACCEPTED_FILE_TYPES: AcceptedFileType[] = import.meta.env.VITE_ACCEPTED_FILE_TYPES
    ? (import.meta.env.VITE_ACCEPTED_FILE_TYPES.split(',') as AcceptedFileType[])
    : [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'text/plain',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
  static readonly FILE_TYPE_LABELS: Record<AcceptedFileType, string> = {
    'application/pdf': 'PDF',
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'text/plain': 'TXT',
    'text/csv': 'CSV',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  };
  static readonly MAX_UPLOAD_SIZE: number = import.meta.env.VITE_MAX_UPLOAD_SIZE
    ? Number(import.meta.env.VITE_MAX_UPLOAD_SIZE)
    : 100; // 100 MB
}
