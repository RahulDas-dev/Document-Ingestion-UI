/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_MAX_UPLOAD_SIZE: string;
  readonly VITE_ACCEPTED_FILE_TYPES: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
