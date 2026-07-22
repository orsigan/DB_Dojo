import type { Exercise } from '../../domain/exercise';
import type { ExerciseId } from '../../domain/ids';

export interface ExerciseRepository {
  list(topic?: string[]): Promise<Exercise[]>;
  findById(id: ExerciseId): Promise<Exercise | undefined>;
}
