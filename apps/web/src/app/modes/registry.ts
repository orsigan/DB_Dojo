import { exerciseMode } from './exercise-mode';
import { freeMode } from './free-mode';
import { guidedMode } from './guided-mode';
import { historyMode } from './history-mode';
import { homeMode } from './home-mode';
import { libraryMode } from './library-mode';
import { settingsMode } from './settings-mode';
import { statsMode } from './stats-mode';
import type { ModeDefinition } from './types';

export const modes: ModeDefinition[] = [
  homeMode,
  guidedMode,
  freeMode,
  statsMode,
  historyMode,
  settingsMode,
  libraryMode,
  exerciseMode
];
