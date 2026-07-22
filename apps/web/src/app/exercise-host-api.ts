import {
  type Exercise,
  introspectSchema,
  type Language,
  runSql,
  submitSolution
} from '@db-dojo/core';
import type { ExerciseHostApi } from '@db-dojo/exercise-kit';
import type { Services } from './composition-root';

export function createHostApi(
  services: Services,
  exercise: Exercise,
  language: Language
): ExerciseHostApi {
  return {
    runSql: (sql) => runSql(services, sql),
    submit: (sql) => submitSolution(services, exercise.id, sql, language),
    reset: async () => {
      await services.engine.reset();
      await services.engine.exec(exercise.seedSql);
    },
    introspectSchema: () => introspectSchema(services.engine)
  };
}
