// Wrapper for react-native-toast-notifications using an imperative ref.
// Expose a setter so the app's Root layout can register the provider ref.
// Avoid importing types from native module in test environment — use a loose any type
type ToastRef = any;

let _toastRef: ToastRef | null = null;

export function setToastRef(ref: ToastRef | null) {
  _toastRef = ref;
}

export type ToastOpts = {
  type?: string;
  text1: string;
  text2?: string;
  visibilityTime?: number;
  placement?: 'top' | 'bottom';
};

export function showToast(opts: ToastOpts) {
  try {
    if (!_toastRef) return;
    const message = opts.text2 ? `${opts.text1}\n${opts.text2}` : opts.text1;
    // Some toast providers return an id when showing; preserve that if available
    return _toastRef.show(message, {
      type: opts.type ?? 'normal',
      duration: opts.visibilityTime ?? 4000,
      placement: opts.placement ?? 'top',
    });
  } catch (err) {
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
    if (typeof _toastRef.dismiss === 'function') return _toastRef.dismiss();
  } catch {}
}

export const toastSuccess = (text1: string, text2?: string, visibilityTime?: number) =>
  showToast({ type: 'success', text1, text2, visibilityTime });

export const toastError = (text1: string, text2?: string, visibilityTime?: number) =>
  showToast({ type: 'danger', text1, text2, visibilityTime });

export const toastInfo = (text1: string, text2?: string, visibilityTime?: number) =>
  showToast({ type: 'normal', text1, text2, visibilityTime });

export default showToast;
