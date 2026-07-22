import { useCallback, useRef, useState } from 'react';
import { notificationsEnabled } from '../../app/notifications-settings';
import type { ToastInput, ToastItem } from './toast-types';
import { DEFAULT_DURATION_MS, DEFAULT_ICON, TOAST_EXIT_MS } from './toast-types';

export function useToastState() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(0);

  const showToast = useCallback((toast: ToastInput) => {
    if (!notificationsEnabled()) {
      return;
    }
    const id = nextIdRef.current;
    nextIdRef.current += 1;
    setToasts((current) => [
      ...current,
      {
        ...toast,
        id,
        icon: toast.icon ?? DEFAULT_ICON[toast.kind],
        durationMs: toast.durationMs ?? DEFAULT_DURATION_MS[toast.kind],
        closing: false
      }
    ]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) =>
      current.map((toast) => (toast.id === id ? { ...toast, closing: true } : toast))
    );
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, TOAST_EXIT_MS);
  }, []);

  return { toasts, showToast, dismissToast };
}
