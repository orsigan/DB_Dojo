export type ToastKind =
  | 'exercise-passed'
  | 'milestone'
  | 'achievement'
  | 'streak-kept'
  | 'streak-risk'
  | 'backup-success'
  | 'backup-error';

export interface ToastInput {
  kind: ToastKind;
  title: string;
  message?: string;
  icon?: string;
  durationMs?: number;
}

export interface ToastItem extends ToastInput {
  id: number;
  icon: string;
  durationMs: number;
  closing: boolean;
}

export const TOAST_EXIT_MS = 200;

export const DEFAULT_ICON: Record<ToastKind, string> = {
  'exercise-passed': '✅',
  milestone: '🚩',
  achievement: '🏆',
  'streak-kept': '🔥',
  'streak-risk': '⏳',
  'backup-success': '💾',
  'backup-error': '⚠️'
};

export const DEFAULT_DURATION_MS: Record<ToastKind, number> = {
  'exercise-passed': 4000,
  milestone: 5500,
  achievement: 5500,
  'streak-kept': 4500,
  'streak-risk': 7000,
  'backup-success': 3500,
  'backup-error': 5000
};
