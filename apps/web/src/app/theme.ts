import { useEffect } from 'react';
import { useLocalStorageState } from './use-local-storage-state';

export type Theme = 'light' | 'dark';

function systemTheme(): Theme {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [explicit, setExplicit] = useLocalStorageState<Theme | null>('db-dojo:theme', null);
  const theme = explicit ?? systemTheme();

  useEffect(() => {
    if (explicit) {
      document.documentElement.setAttribute('data-theme', explicit);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [explicit]);

  return {
    theme,
    toggleTheme: () => setExplicit(theme === 'dark' ? 'light' : 'dark')
  };
}
