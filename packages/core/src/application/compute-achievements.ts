import type { Difficulty, Exercise } from '../domain/exercise';
import type { LocalizedText } from '../domain/localized-text';
import { analyzeProgress, type ExerciseProgress } from './analyze-progress';
import { computeStreak, type Streak } from './compute-streak';
import type { Attempt } from './ports/progress-repository';

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface Achievement {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  unlocked: boolean;
  progress?: AchievementProgress;
}

interface Milestone {
  target: number;
  title: LocalizedText;
  description: LocalizedText;
}

const SOLVED_MILESTONES: Milestone[] = [
  {
    target: 1,
    title: { de: 'Erste Schritte', en: 'First Steps' },
    description: { de: 'Erste Übung gelöst', en: 'Solved your first exercise' }
  },
  {
    target: 10,
    title: { de: 'Warmgelaufen', en: 'Warmed Up' },
    description: { de: '10 Übungen gelöst', en: 'Solved 10 exercises' }
  },
  {
    target: 25,
    title: { de: 'Auf Kurs', en: 'On a Roll' },
    description: { de: '25 Übungen gelöst', en: 'Solved 25 exercises' }
  },
  {
    target: 50,
    title: { de: 'Routinier', en: 'Seasoned' },
    description: { de: '50 Übungen gelöst', en: 'Solved 50 exercises' }
  }
];

const STREAK_MILESTONES: Milestone[] = [
  {
    target: 3,
    title: { de: 'Drei Tage am Stück', en: 'Three-Day Streak' },
    description: { de: '3 Tage in Folge geübt', en: 'Practiced 3 days in a row' }
  },
  {
    target: 7,
    title: { de: 'Eine Woche dran', en: 'Full Week' },
    description: { de: '7 Tage in Folge geübt', en: 'Practiced 7 days in a row' }
  },
  {
    target: 30,
    title: { de: 'Ein Monat Serie', en: 'Month-Long Streak' },
    description: { de: '30 Tage in Folge geübt', en: 'Practiced 30 days in a row' }
  }
];

type HigherDifficulty = Exclude<Difficulty, 'Beginner'>;

const HIGHER_DIFFICULTIES: HigherDifficulty[] = ['Advanced', 'Profi', 'Ultra'];

const DIFFICULTY_ACHIEVEMENTS: Record<
  HigherDifficulty,
  { icon: string; title: LocalizedText; description: LocalizedText }
> = {
  Advanced: {
    icon: '⚡',
    title: { de: 'Fortgeschritten', en: 'Leveling Up' },
    description: {
      de: 'Erste Übung der Stufe Advanced gelöst',
      en: 'Solved your first Advanced exercise'
    }
  },
  Profi: {
    icon: '💎',
    title: { de: 'Profi-Niveau', en: 'Pro Level' },
    description: {
      de: 'Erste Übung der Stufe Profi gelöst',
      en: 'Solved your first Profi exercise'
    }
  },
  Ultra: {
    icon: '👑',
    title: { de: 'Ultra-Herausforderer', en: 'Ultra Challenger' },
    description: {
      de: 'Erste Übung der Stufe Ultra gelöst',
      en: 'Solved your first Ultra exercise'
    }
  }
};

export const TOPIC_ICONS: Record<string, string> = {
  ddl: '🏗️',
  dml: '✍️',
  sql: '🔎',
  views: '🪟',
  plpgsql: '🧩',
  integrity: '🛡️',
  permissions: '🔑'
};

export function computeAchievements(attempts: Attempt[], exercises: Exercise[]): Achievement[] {
  const analysis = analyzeProgress(attempts, exercises);
  const streak = computeStreak(attempts);
  const solvedCount = Object.values(analysis.perExercise).filter(
    (progress) => progress.passed
  ).length;

  return [
    ...solvedMilestoneAchievements(solvedCount),
    allExercisesSolvedAchievement(solvedCount, exercises.length),
    ...topicAchievements(exercises, analysis.perExercise),
    ...difficultyAchievements(exercises, analysis.perExercise),
    ...streakAchievements(streak)
  ];
}

function solvedMilestoneAchievements(solvedCount: number): Achievement[] {
  return SOLVED_MILESTONES.map((milestone) => {
    const unlocked = solvedCount >= milestone.target;
    return {
      id: milestone.target === 1 ? 'first-exercise-solved' : `solved-${milestone.target}`,
      title: milestone.title,
      description: milestone.description,
      icon: milestone.target === 1 ? '🎯' : '🏅',
      unlocked,
      ...(unlocked ? {} : { progress: { current: solvedCount, target: milestone.target } })
    };
  });
}

function allExercisesSolvedAchievement(solvedCount: number, totalExercises: number): Achievement {
  const unlocked = totalExercises > 0 && solvedCount === totalExercises;
  return {
    id: 'all-exercises-solved',
    title: { de: 'Meister:in', en: 'Completionist' },
    description: { de: 'Alle Übungen gelöst', en: 'Solved every exercise' },
    icon: '🏆',
    unlocked,
    ...(unlocked ? {} : { progress: { current: solvedCount, target: totalExercises } })
  };
}

function topicAchievements(
  exercises: Exercise[],
  perExercise: Record<string, ExerciseProgress>
): Achievement[] {
  return topLevelTopics(exercises).map((topicKey) => {
    const topicExercises = exercises.filter((exercise) => exercise.topic[0] === topicKey);
    const passedCount = topicExercises.filter(
      (exercise) => perExercise[exercise.id]?.passed
    ).length;
    const unlocked = topicExercises.length > 0 && passedCount === topicExercises.length;
    const label = topicDisplayName(topicKey);
    return {
      id: `topic-${topicKey}`,
      title: { de: `Kapitel ${label} abgeschlossen`, en: `${label} Chapter Complete` },
      description: {
        de: `Alle Übungen im Bereich ${label} gelöst`,
        en: `Solved every exercise in ${label}`
      },
      icon: TOPIC_ICONS[topicKey] ?? '📘',
      unlocked,
      ...(unlocked ? {} : { progress: { current: passedCount, target: topicExercises.length } })
    };
  });
}

function difficultyAchievements(
  exercises: Exercise[],
  perExercise: Record<string, ExerciseProgress>
): Achievement[] {
  return HIGHER_DIFFICULTIES.map((difficulty) => {
    const unlocked = exercises.some(
      (exercise) => exercise.difficulty === difficulty && perExercise[exercise.id]?.passed
    );
    const { icon, title, description } = DIFFICULTY_ACHIEVEMENTS[difficulty];
    return {
      id: `difficulty-${difficulty.toLowerCase()}-solved`,
      title,
      description,
      icon,
      unlocked
    };
  });
}

function streakAchievements(streak: Streak): Achievement[] {
  const best = Math.max(streak.current, streak.longest);
  return STREAK_MILESTONES.map((milestone) => {
    const unlocked = best >= milestone.target;
    return {
      id: `streak-${milestone.target}`,
      title: milestone.title,
      description: milestone.description,
      icon: '🔥',
      unlocked,
      ...(unlocked ? {} : { progress: { current: best, target: milestone.target } })
    };
  });
}

function topLevelTopics(exercises: Exercise[]): string[] {
  const keys = new Set<string>();
  for (const exercise of exercises) {
    const key = exercise.topic[0];
    if (key) {
      keys.add(key);
    }
  }
  return [...keys];
}

const TOPIC_LABEL_OVERRIDES: Record<string, string> = {
  plpgsql: 'PL/pgSQL'
};

function topicDisplayName(topicKey: string): string {
  const override = TOPIC_LABEL_OVERRIDES[topicKey];
  if (override) {
    return override;
  }
  return topicKey
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) =>
      word.length <= 4 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
}
