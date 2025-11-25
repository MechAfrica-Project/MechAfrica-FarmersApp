// Wrapper for react-native-toast-notifications using an imperative ref.
// Expose a setter so the app's Root layout can register the provider ref.
// Avoid importing types from native module in test environment — use a loose any type
type ToastRef = any;

let _toastRef: ToastRef | null = null;

// Debounce mechanism to prevent toast spam
let lastToastTime = 0;
const TOAST_DEBOUNCE_MS = 200;

export function setToastRef(ref: ToastRef | null) {
  _toastRef = ref;
}

export type ToastOpts = {
  type?: 'success' | 'error' | 'info' | 'warning' | 'normal';
  text1: string;
  text2?: string;
  visibilityTime?: number;
  placement?: 'top' | 'bottom';
  // Optional actions rendered inside the toast. Handlers are invoked when action pressed.
  actions?: Array<{
    label: string;
    onPress?: () => void;
    // styling hint consumers may use (e.g., 'destructive')
    style?: 'default' | 'destructive' | 'primary';
  }>;
};

export function showToast(opts: ToastOpts) {
  try {
    if (!_toastRef) {
      console.warn('Toast ref not set, cannot show toast');
      return;
    }

    // Validate required fields
    if (!opts.text1?.trim()) {
      console.warn('Toast text1 is required');
      return;
    }

    // Prevent toast spam by debouncing
    const now = Date.now();
    if (now - lastToastTime < TOAST_DEBOUNCE_MS) {
      console.debug('Toast debounced to prevent spam');
      return;
    }
    lastToastTime = now;

    // Use appropriate duration based on toast type
    const getDefaultDuration = (type?: string) => {
      switch (type) {
        case 'error':
          return 5000; // Errors should be visible longer
        case 'warning':
          return 4500;
        case 'success':
          return 3500; // Success messages can be shorter
        default:
          return 4000;
      }
    };

    // Ensure text content is properly formatted
    const title = opts.text2 ? opts.text1 : undefined;
    const message = opts.text2 || opts.text1;

    // Some toast providers return an id when showing; preserve that if available
    return _toastRef.show(message, {
      type: opts.type ?? 'normal',
      duration: opts.visibilityTime ?? getDefaultDuration(opts.type),
      placement: opts.placement ?? 'top',
      data: {
        title,
        actions: opts.actions,
      },
    });
  } catch (err) {
    console.warn('Toast failed to show:', err);
    // Swallow - toast failure shouldn't crash the app
  }
}

/**
 * Dismiss visible toasts. Implementation is defensive because provider APIs vary.
 */
export function dismissToasts() {
  try {
    if (!_toastRef) return;
    // Try common API names
    if (typeof _toastRef.hideAll === 'function') return _toastRef.hideAll();
    if (typeof _toastRef.hide === 'function') return _toastRef.hide();
    if (typeof _toastRef.dismissAll === 'function') return _toastRef.dismissAll();
    if (typeof _toastRef.dismiss === 'function') return _toastRef.dismiss();
  } catch {}
}

/**
 * Dismiss a specific toast by ID if supported
 */
export function dismissToast(toastId: string | number) {
  try {
    if (!_toastRef) return;
    // Try to hide specific toast if API supports it
    if (typeof _toastRef.hide === 'function' && toastId) {
      return _toastRef.hide(toastId);
    }
  } catch {}
}

export const toastSuccess = (text1: string, text2?: string, visibilityTime?: number) =>
  showToast({ type: 'success', text1, text2, visibilityTime });

export const toastError = (text1: string, text2?: string, visibilityTime?: number) =>
  showToast({ type: 'error', text1, text2, visibilityTime });

export const toastInfo = (text1: string, text2?: string, visibilityTime?: number) =>
  showToast({ type: 'info', text1, text2, visibilityTime });

// Queued/background notifications are shown at the bottom by default.
export const toastQueued = (text1: string, text2?: string, visibilityTime?: number) =>
  showToast({ type: 'info', text1, text2, visibilityTime, placement: 'bottom' });

export default showToast;
