import type { Exercise, Language, QueryResult, Result, SchemaInfo, Verdict } from '@db-dojo/core';
import type { ReactNode } from 'react';

export interface ExerciseHostApi {
  runSql(sql: string): Promise<Result<QueryResult>>;
  submit(sql: string): Promise<Result<Verdict>>;
  reset(): Promise<void>;
  introspectSchema(): Promise<Result<SchemaInfo>>;
}

export interface ExerciseViewProps {
  exercise: Exercise;
  host: ExerciseHostApi;
  language: Language;
}

export type ExerciseView = (props: ExerciseViewProps) => ReactNode;

export interface ExerciseModule {
  definition: Exercise;
  View?: ExerciseView;
}

export function defineExercise(module: ExerciseModule): ExerciseModule {
  return module;
}
