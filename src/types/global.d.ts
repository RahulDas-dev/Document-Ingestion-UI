import { ShowToast } from './toast';

declare global {
  interface Window {
    showToast: ShowToast;
  }
}
