import { useEffect, useMemo, useState } from 'react';
import { createServices } from './app/composition-root';
import { LanguageProvider } from './app/i18n/use-language';
import { ServicesProvider } from './app/services-context';
import { AppShell } from './shell/AppShell';
import { ToastProvider } from './shell/ToastProvider';

type BootStatus = 'starting' | 'ready' | 'error';

export function App() {
  const services = useMemo(() => createServices(), []);
  const [status, setStatus] = useState<BootStatus>('starting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    services.engine.init().then((result) => {
      if (!active) {
        return;
      }
      if (result.success) {
        setStatus('ready');
      } else {
        setError(result.error.message);
        setStatus('error');
      }
    });

    return () => {
      active = false;
    };
  }, [services]);

  if (status === 'error') {
    return <div className="boot">Database failed to start: {error}</div>;
  }
  if (status === 'starting') {
    return <div className="boot">Starting PostgreSQL…</div>;
  }

  return (
    <LanguageProvider>
      <ServicesProvider services={services}>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </ServicesProvider>
    </LanguageProvider>
  );
}
