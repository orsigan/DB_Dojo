import { DiagramExerciseView, type ExerciseViewProps } from '@db-dojo/exercise-kit';

export function ExerciseView(props: ExerciseViewProps) {
  return <DiagramExerciseView {...props} toolset="relational" />;
}
