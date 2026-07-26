import type { Diagram } from '../domain/diagram';
import { appError } from '../domain/errors';
import type { ExerciseId } from '../domain/ids';
import type { Language } from '../domain/localized-text';
import { failure, type Result, success } from '../domain/result';
import type { Verdict } from '../domain/verdict';
import { gradeDiagram } from './grade-diagram';
import type { ExerciseRepository } from './ports/exercise-repository';
import type { ProgressRepository } from './ports/progress-repository';
import type { Clock } from './ports/system';
import type { TelemetrySink } from './ports/telemetry';

export interface SubmitDiagramDependencies {
  exercises: ExerciseRepository;
  progress: ProgressRepository;
  telemetry: TelemetrySink;
  clock: Clock;
}

export async function submitDiagram(
  dependencies: SubmitDiagramDependencies,
  exerciseId: ExerciseId,
  diagram: Diagram,
  language: Language
): Promise<Result<Verdict>> {
  const exercise = await dependencies.exercises.findById(exerciseId);
  if (!exercise) {
    return failure(appError('exercise-not-found', `Exercise "${exerciseId}" was not found.`));
  }
  if (exercise.grading.kind !== 'diagram') {
    return failure(
      appError('grading-failed', `Exercise "${exerciseId}" is not graded as a diagram.`)
    );
  }

  const startedAt = dependencies.clock.elapsedMs();
  const verdict = gradeDiagram(diagram, exercise.grading, language);
  const durationMs = dependencies.clock.elapsedMs() - startedAt;

  await dependencies.progress.record({
    exerciseId,
    passed: verdict.passed,
    durationMs,
    at: dependencies.clock.now().toISOString()
  });

  dependencies.telemetry.emit({
    type: 'exercise-submitted',
    exerciseId,
    passed: verdict.passed,
    durationMs
  });

  return success(verdict);
}
