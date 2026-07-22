import { translations } from './translations';
import { useLanguage } from './use-language';

type Dictionary = Record<string, Record<string, string>>;

export function useTranslation(): {
  t: (key: string, vars?: Record<string, string | number>) => string;
} {
  const { language } = useLanguage();

  function t(key: string, vars?: Record<string, string | number>): string {
    const [namespace, entry] = key.split('.');
    const value = (translations[language] as Dictionary)[namespace ?? '']?.[entry ?? ''];
    if (value === undefined) {
      return key;
    }
    if (!vars) {
      return value;
    }
    return Object.entries(vars).reduce(
      (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
      value
    );
  }

  return { t };
}
