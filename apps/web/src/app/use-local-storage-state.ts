import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

export function useLocalStorageState<Value>(
  key: string,
  initial: Value
): [Value, Dispatch<SetStateAction<Value>>] {
  const [value, setValue] = useState<Value>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as Value) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode/quota) — state stays in-memory only
    }
  }, [key, value]);

  return [value, setValue];
}
