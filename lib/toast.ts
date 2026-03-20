import { getNodeEnv } from './env';

// Wrapper for react-native-toast-notifications using an imperative ref.
// Expose a setter so the app's Root layout can register the provider ref.
// Avoid importing types from native module in test environment — use a loose any type
type ToastRef = any;

let _toastRef: ToastRef | null = null;

// Debounce mechanism to prevent toast spam
// Prevent duplicate toasts from showing in a short window (ms).
// We prefer deduping identical messages rather than globally delaying all toasts.
const DEDUPE_WINDOW_MS = 800;
const recentToastTimestamps: Record<string, number> = {};

// In-memory queue for toasts fired before provider mounts
const queuedToasts: ToastOpts[] = [];
const MAX_QUEUE_LENGTH = 20;
// Track visible toasts and enforce a maximum so new toasts aren't delayed.
const MAX_VISIBLE_TOASTS = 3;
type VisibleToast = { id: string | number; type?: string; isActionable: boolean; ts: number };
const visibleToasts: VisibleToast[] = [];
// Aggregation state for queued/info toasts (avoid many repeated small toasts)
const AGGREGATION_WINDOW_MS = 2000;
type AggState = { id?: string | number; count: number; timeout?: ReturnType<typeof setTimeout> };
const aggregation: Record<string, AggState> = {};

export function setToastRef(ref: ToastRef | null) {
  _toastRef = ref;
  // flush queued toasts when provider becomes available
  try {
    if (_toastRef && queuedToasts.length > 0) {
      // drain queue in order
      while (queuedToasts.length) {
        const t = queuedToasts.shift();
        try {
          if (!t) continue;
          const title = t.text2 ? t.text1 : undefined;
          const message = t.text2 || t.text1;
          const duration = t.visibilityTime ?? (function getDefaultDuration(type?: string) {
            switch (type) {
              case 'error':
                return 5000;
              case 'warning':
                return 4500;
              case 'success':
                return 3500;
              default:
                return 4000;
            }
          })(t.type);

          // show directly on provider to avoid re-entrancy into showToast's queue logic
          _toastRef.show(message, {
            type: t.type ?? 'normal',
            duration,
            placement: t.placement ?? 'top',
            data: { title, actions: t.actions },
          });
        } catch {}
      }
    }
  } catch {}
}
export type ToastOpts = {
  type?: 'success' | 'error' | 'info' | 'warning' | 'normal';
  text1: string;
  text2?: string;
  visibilityTime?: number;
  placement?: 'top' | 'bottom';
  // Optional actions rendered inside the toast. Handlers are invoked when action pressed.
  actions?: {
    label: string;
    onPress?: () => void;
    // styling hint consumers may use (e.g., 'destructive')
    style?: 'default' | 'destructive' | 'primary';
  }[];
};

export function showToast(opts: ToastOpts) {
  try {
    if (!_toastRef) {
      // When provider isn't mounted yet, queue the toast for later flushing.
      // Avoid noisy warnings during tests.
      if (getNodeEnv() !== 'test') {
        console.warn('Toast provider not mounted yet — queuing toast');
      }
      try {
        if (queuedToasts.length < MAX_QUEUE_LENGTH) queuedToasts.push(opts);
      } catch {}
      return;
    }

    // Validate required fields
    if (!opts.text1?.trim()) {
      console.warn('Toast text1 is required');
      return;
    }

    // Deduplicate identical toasts shown in a short window to avoid spammy repeats.
    // Exempt errors and actionable toasts (they should always be visible).
    const isActionable = Array.isArray(opts.actions) && opts.actions.length > 0;
    if (opts.type !== 'error' && !isActionable) {
      const key = `${opts.type || 'normal'}|${opts.text1}|${opts.text2 || ''}`;
      const now = Date.now();
      const last = recentToastTimestamps[key] || 0;
      if (now - last < DEDUPE_WINDOW_MS) {
        // skip duplicate
        return;
      }
      recentToastTimestamps[key] = now;
    }

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
    const id = _toastRef.show(message, {
      type: opts.type ?? 'normal',
      duration: opts.visibilityTime ?? getDefaultDuration(opts.type),
      placement: opts.placement ?? 'top',
      data: {
        title,
        actions: opts.actions,
      },
    });

    try {
      // Track visible toasts if provider returned an id
      if (id) {
        visibleToasts.push({ id, type: opts.type, isActionable: isActionable, ts: Date.now() });

        // If we exceed the visible limit, dismiss the oldest low-priority toast
        if (visibleToasts.length > MAX_VISIBLE_TOASTS) {
          const idx = visibleToasts.findIndex((v) => v.type !== 'error' && !v.isActionable);
          const removeIdx = idx >= 0 ? idx : 0; // fallback to oldest if none found
          const removed = visibleToasts.splice(removeIdx, 1)[0];
          try {
            // Dismiss via provider if supported
            if (_toastRef) {
              if (typeof _toastRef.hide === 'function') _toastRef.hide(removed.id);
              else if (typeof _toastRef.dismiss === 'function') _toastRef.dismiss(removed.id);
            }
          } catch {}
        }
      }
    } catch {}

    return id;
  } catch (err) {
    if (getNodeEnv() !== 'test') console.warn('Toast failed to show:', err);
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
    if (typeof _toastRef.hideAll === 'function') {
      visibleToasts.length = 0;
      return _toastRef.hideAll();
    }
    if (typeof _toastRef.hide === 'function') {
      visibleToasts.length = 0;
      return _toastRef.hide();
    }
    if (typeof _toastRef.dismissAll === 'function') {
      visibleToasts.length = 0;
      return _toastRef.dismissAll();
    }
    if (typeof _toastRef.dismiss === 'function') {
      visibleToasts.length = 0;
      return _toastRef.dismiss();
    }
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
      // remove from our tracking list
      const idx = visibleToasts.findIndex((v) => v.id === toastId);
      if (idx >= 0) visibleToasts.splice(idx, 1);
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
  showQueuedAggregated(text1, text2, visibilityTime);

function showQueuedAggregated(text1: string, text2?: string, visibilityTime?: number) {
  const key = `${text1}|${text2 || ''}`;

  // If provider not ready, fall back to queueing via showToast to preserve behavior
  if (!_toastRef) {
    return showToast({ type: 'info', text1, text2, visibilityTime, placement: 'bottom' });
  }

  try {
    const nowState = aggregation[key] || { count: 0 };
    nowState.count = (nowState.count || 0) + 1;

    // Build user-facing message: prefer a concise aggregated message
    const title = text1;
    const message = text2 ? `${nowState.count} ${text2}` : `${title} (${nowState.count})`;

    // If there is an existing toast id, dismiss it and re-show updated count.
    if (nowState.id && _toastRef) {
      try {
        if (typeof _toastRef.hide === 'function') _toastRef.hide(nowState.id);
        else if (typeof _toastRef.dismiss === 'function') _toastRef.dismiss(nowState.id);
      } catch {}
    }

    const id = _toastRef.show(message, {
      type: 'info',
      duration: visibilityTime ?? 3500,
      placement: 'bottom',
      data: { title },
    });

    nowState.id = id;

    // Reset aggregation window timeout
    if (nowState.timeout) clearTimeout(nowState.timeout);
    nowState.timeout = setTimeout(() => {
      // clear aggregation after window
      try {
        if (nowState.id && _toastRef) {
          if (typeof _toastRef.hide === 'function') _toastRef.hide(nowState.id);
          else if (typeof _toastRef.dismiss === 'function') _toastRef.dismiss(nowState.id);
        }
      } catch {}
      delete aggregation[key];
    }, AGGREGATION_WINDOW_MS) as ReturnType<typeof setTimeout>;

    aggregation[key] = nowState;
    return id;
  } catch {
    // fallback to non-aggregated
    return showToast({ type: 'info', text1, text2, visibilityTime, placement: 'bottom' });
  }
}

/**
 * Show a confirmation-style toast with action buttons. Designed to replace native
 * confirmation dialogs in most flows. `buttons` mirrors React Native's
 * Alert.button shape: { text, onPress, style }.
 */
export const toastConfirm = (
  title: string,
  message?: string,
  buttons?: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[],
  placement: 'top' | 'bottom' = 'top'
) => {
  const actions: ToastOpts['actions'] = (buttons || [{ text: 'OK' }]).map((b) => ({
    label: b.text,
    onPress: b.onPress,
    // Map native Alert styles to our toast action style union
    style: (b.style === 'destructive' ? 'destructive' : 'default') as 'default' | 'destructive' | 'primary',
  }));

  return showToast({ type: 'normal', text1: title || '', text2: message, actions, placement });
};

export default showToast;
