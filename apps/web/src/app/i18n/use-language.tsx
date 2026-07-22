import { createContext, type ReactNode, useContext } from 'react';
import { useLocalStorageState } from '../use-local-storage-state';
import type { Language } from './translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useLocalStorageState<Language>('db-dojo:language', 'de');
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be called inside <LanguageProvider>.');
  }
  return context;
}
