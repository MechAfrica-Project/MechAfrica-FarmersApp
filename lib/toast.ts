// lib/toast.ts
import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  description?: string;
  duration?: number;
  position?: 'top' | 'bottom';
  visibilityTime?: number;
}

/**
 * Show a success toast message
 */
export function showSuccessToast(message: string, options?: Partial<ToastOptions>) {
  Toast.show({
    type: 'success',
    text1: message,
    text2: options?.description,
    position: options?.position || 'top',
    visibilityTime: options?.visibilityTime || 3000,
    autoHide: true,
  });
}

/**
 * Show an error toast message
 */
export function showErrorToast(message: string, options?: Partial<ToastOptions>) {
  Toast.show({
    type: 'error',
    text1: message,
    text2: options?.description,
    position: options?.position || 'top',
    visibilityTime: options?.visibilityTime || 4000,
    autoHide: true,
  });
}

/**
 * Show an info toast message
 */
export function showInfoToast(message: string, options?: Partial<ToastOptions>) {
  Toast.show({
    type: 'info',
    text1: message,
    text2: options?.description,
    position: options?.position || 'top',
    visibilityTime: options?.visibilityTime || 3000,
    autoHide: true,
  });
}

/**
 * Show a network error toast with appropriate messaging
 */
export function showNetworkErrorToast(error?: Error | string) {
  const errorMessage = typeof error === 'string'
    ? error
    : error?.message || 'Network error. Please check your connection and try again.';

  showErrorToast('Connection Error', {
    description: errorMessage,
    visibilityTime: 5000,
  });
}

/**
 * Show a toast for API errors with user-friendly messages
 */
export function showAPIErrorToast(error: Error | string, statusCode?: number) {
  let message = 'An error occurred';
  let description = typeof error === 'string' ? error : error?.message || 'Please try again';

  // Map common HTTP status codes to user-friendly messages
  if (statusCode) {
    switch (statusCode) {
      case 400:
        message = 'Invalid Request';
        description = description || 'Please check your input and try again.';
        break;
      case 401:
        message = 'Authentication Failed';
        description = 'Please login again.';
        break;
      case 403:
        message = 'Access Denied';
        description = 'You do not have permission to perform this action.';
        break;
      case 404:
        message = 'Not Found';
        description = 'The requested resource was not found.';
        break;
      case 429:
        message = 'Too Many Requests';
        description = 'Please wait a moment and try again.';
        break;
      case 500:
      case 502:
      case 503:
        message = 'Server Error';
        description = 'Our servers are experiencing issues. Please try again later.';
        break;
      default:
        message = 'Request Failed';
    }
  }

  showErrorToast(message, {
    description,
    visibilityTime: 5000,
  });
}

/**
 * Hide the current toast
 */
export function hideToast() {
  Toast.hide();
}

/**
 * Legacy Support for Farmers App old toast functions.
 * These map to the new react-native-toast-message implementation.
 */
export const toastSuccess = (text1: string, text2?: string, visibilityTime?: number) => {
  showSuccessToast(text1, { description: text2, visibilityTime });
};

export const toastError = (text1: string, text2?: string, visibilityTime?: number) => {
  showErrorToast(text1, { description: text2, visibilityTime });
};

export const toastInfo = (text1: string, text2?: string, visibilityTime?: number) => {
  showInfoToast(text1, { description: text2, visibilityTime });
};

export const dismissToasts = () => {
  hideToast();
};

export const dismissToast = () => {
  hideToast();
};

export default Toast.show;
