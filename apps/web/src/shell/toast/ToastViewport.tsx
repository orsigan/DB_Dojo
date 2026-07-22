import { useEffect } from 'react';
import type { ToastItem } from './toast-types';

export function ToastViewport({
  toasts,
  onDismiss
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) {
    return null;
  }
  return (
    <div className="toast-viewport" aria-live="polite">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    if (toast.closing || toast.durationMs <= 0) {
      return;
    }
    const timer = window.setTimeout(onDismiss, toast.durationMs);
    return () => window.clearTimeout(timer);
  }, [toast.closing, toast.durationMs, onDismiss]);

  return (
    <button
      type="button"
      className={
        toast.closing ? `toast-card toast-${toast.kind} closing` : `toast-card toast-${toast.kind}`
      }
      onClick={onDismiss}
    >
      <span className="toast-card-icon" aria-hidden="true">
        {toast.icon}
      </span>
      <span className="toast-card-text">
        <span className="toast-card-title">{toast.title}</span>
        {toast.message && <span className="toast-card-message">{toast.message}</span>}
      </span>
      <span className="toast-card-close" aria-hidden="true">
        ×
      </span>
    </button>
  );
}
