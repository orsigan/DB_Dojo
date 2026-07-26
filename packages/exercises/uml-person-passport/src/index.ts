import { defineExercise } from '@db-dojo/exercise-kit';
import { definition } from './definition';
import { ExerciseView } from './ExerciseView';

export default defineExercise({ definition, View: ExerciseView });
