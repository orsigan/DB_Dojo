import type { ReactNode } from 'react';
import { ToastViewport } from './toast/ToastViewport';
import { ToastContext } from './toast/toast-context';
import { useProgressToasts } from './toast/use-progress-toasts';
import { useStreakRiskToast } from './toast/use-streak-risk-toast';
import { useToastState } from './toast/use-toast-state';

export { useToast } from './toast/toast-context';
export type { ToastInput, ToastKind } from './toast/toast-types';

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, showToast, dismissToast } = useToastState();
  useProgressToasts(showToast);
  useStreakRiskToast(showToast);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
