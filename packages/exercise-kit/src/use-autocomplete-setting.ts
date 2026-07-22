import { useEffect, useState } from 'react';

const STORAGE_KEY = 'db-dojo:sql-autocomplete';

export function useAutocompleteSetting(): [boolean, (enabled: boolean) => void] {
  const [enabled, setEnabled] = useState(() => window.localStorage.getItem(STORAGE_KEY) === 'true');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  }, [enabled]);

  return [enabled, setEnabled];
}
