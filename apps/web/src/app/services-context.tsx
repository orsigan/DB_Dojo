import { createContext, type ReactNode, useContext } from 'react';
import type { Services } from './composition-root';

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({
  services,
  children
}: {
  services: Services;
  children: ReactNode;
}) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useServices must be called inside <ServicesProvider>.');
  }
  return services;
}
