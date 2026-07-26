import {
  type Exercise,
  introspectSchema,
  type Language,
  runSql,
  submitDiagram,
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
    submitDiagram: (diagram) => submitDiagram(services, exercise.id, diagram, language),
    reset: async () => {
      await services.engine.reset();
      await services.engine.exec(exercise.seedSql);
    },
    introspectSchema: () => introspectSchema(services.engine)
  };
}
