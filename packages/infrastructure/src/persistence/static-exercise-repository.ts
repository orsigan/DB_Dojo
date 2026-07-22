import type { Exercise, ExerciseId, ExerciseRepository } from '@db-dojo/core';

export class StaticExerciseRepository implements ExerciseRepository {
  constructor(private readonly exercises: Exercise[]) {}

  async list(topic?: string[]): Promise<Exercise[]> {
    if (!topic || topic.length === 0) {
      return this.exercises;
    }
    return this.exercises.filter((exercise) =>
      topic.every((segment, i) => exercise.topic[i] === segment)
    );
  }

  async findById(id: ExerciseId): Promise<Exercise | undefined> {
    return this.exercises.find((exercise) => exercise.id === id);
  }
}
