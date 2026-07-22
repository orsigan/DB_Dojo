import type { ReactNode } from 'react';

export interface IconBarItemConfig {
  id: string;
  label: string;
  icon: ReactNode;
  panel: (close: () => void) => ReactNode;
  align?: 'start' | 'end';
}
