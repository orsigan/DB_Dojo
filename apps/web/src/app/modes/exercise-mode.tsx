import { ExerciseHost } from '../../shell/ExerciseHost';
import { exerciseModules } from '../exercise-registry';
import type { ModeComponentProps, ModeDefinition, View } from './types';

const PATH_PATTERN = /^\/exercise\/([^/]+)\/?$/;

function ExerciseModeView({ view }: ModeComponentProps) {
  if (view.kind !== 'exercise') {
    return null;
  }
  const module = exerciseModules.find((candidate) => candidate.definition.id === view.id);
  if (!module) {
    return <p className="muted">Exercise "{view.id}" was not found.</p>;
  }
  return <ExerciseHost key={module.definition.id} module={module} />;
}

export const exerciseMode: ModeDefinition = {
  id: 'exercise',
  navLabel: 'Exercise',
  showInSidebar: false,
  Component: ExerciseModeView,
  parsePath: (pathname) => {
    const match = PATH_PATTERN.exec(pathname);
    const rawId = match?.[1];
    return rawId ? { kind: 'exercise', id: decodeURIComponent(rawId) } : null;
  },
  buildPath: (view) =>
    view.kind === 'exercise' ? `/exercise/${encodeURIComponent(view.id)}` : '/',
  defaultView: (): View => ({ kind: 'exercise', id: '' })
};
