import { analyzeProgress, type ProgressAnalysis } from '@db-dojo/core';
import { useEffect, useState } from 'react';
import { exerciseModules } from './exercise-registry';
import { useServices } from './services-context';

export function useProgress(): ProgressAnalysis | null {
  const services = useServices();
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);

  useEffect(() => {
    let active = true;
    services.progress.all().then((attempts) => {
      if (active) {
        setAnalysis(
          analyzeProgress(
            attempts,
            exerciseModules.map((module) => module.definition)
          )
        );
      }
    });
    return () => {
      active = false;
    };
  }, [services]);

  return analysis;
}
