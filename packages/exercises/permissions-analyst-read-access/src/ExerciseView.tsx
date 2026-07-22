import { ExerciseScaffold, type ExerciseViewProps } from '@db-dojo/exercise-kit';

export function ExerciseView(props: ExerciseViewProps) {
  return (
    <div className="permissions-exercise">
      <aside className="side-note">
        <h3>Roles &amp; privileges</h3>
        <p>
          A role is a database principal. Privileges are granted per object with GRANT and taken
          back with REVOKE.
        </p>
      </aside>
      <ExerciseScaffold {...props} />
    </div>
  );
}
