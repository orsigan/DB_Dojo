import { DiagramExerciseView, type ExerciseViewProps } from '@db-dojo/exercise-kit';
import { useMemo } from 'react';
import { createStarterDiagram } from './starter-diagram';

export function ExerciseView(props: ExerciseViewProps) {
  const starterDiagram = useMemo(() => createStarterDiagram(props.language), [props.language]);

  return <DiagramExerciseView {...props} toolset="normalization" starterDiagram={starterDiagram} />;
}
