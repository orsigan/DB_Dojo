import type { Attempt } from '@db-dojo/core';
import { useEffect, useState } from 'react';
import { useServices } from './services-context';

export function useAttempts(): Attempt[] {
  const services = useServices();
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    let active = true;
    services.progress.all().then((value) => {
      if (active) {
        setAttempts(value);
      }
    });
    return () => {
      active = false;
    };
  }, [services]);

  return attempts;
}
