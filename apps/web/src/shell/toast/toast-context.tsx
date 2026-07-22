import { createContext, useContext } from 'react';
import type { ToastInput } from './toast-types';

export interface ToastContextValue {
  showToast: (toast: ToastInput) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be called inside <ToastProvider>.');
  }
  return context;
}
