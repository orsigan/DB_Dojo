import { DefaultExerciseView, type ExerciseModule } from '@db-dojo/exercise-kit';
import { useEffect, useMemo, useState } from 'react';
import { createHostApi } from '../app/exercise-host-api';
import { useLanguage } from '../app/i18n/use-language';
import { useServices } from '../app/services-context';

export function ExerciseHost({ module }: { module: ExerciseModule }) {
  const services = useServices();
  const { language } = useLanguage();
  const [ready, setReady] = useState(false);
  const host = useMemo(
    () => createHostApi(services, module.definition, language),
    [services, module, language]
  );

  useEffect(() => {
    let active = true;
    setReady(false);

    // Diagram exercises never touch the database, so they skip the sandbox entirely.
    // pglite is an isolated in-browser database per tab, so a full reset between
    // exercises is safe — it stops tables from earlier exercises in this session
    // lingering in the schema view. The remote engine is one shared Postgres
    // instance with no per-user isolation, so resetting it on every navigation
    // would wipe other concurrent users' sandboxes; it keeps the additive seed.
    const seedSql = module.definition.seedSql.trim();
    const prepare =
      seedSql === ''
        ? Promise.resolve()
        : services.engine.kind === 'pglite'
          ? services.engine.reset().then(() => services.engine.exec(seedSql))
          : services.engine.exec(seedSql);

    prepare.then(() => {
      if (active) {
        setReady(true);
      }
    });

    services.telemetry.emit({
      type: 'exercise-opened',
      exerciseId: module.definition.id,
      topic: module.definition.topic
    });

    return () => {
      active = false;
    };
  }, [services, module]);

  if (!ready) {
    return <p className="muted">Preparing sandbox…</p>;
  }

  const View = module.View ?? DefaultExerciseView;
  return <View exercise={module.definition} host={host} language={language} />;
}
