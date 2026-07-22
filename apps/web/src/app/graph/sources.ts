import { type ExerciseId, type ExerciseProgress, type Language, localize } from '@db-dojo/core';
import type { ExerciseModule } from '@db-dojo/exercise-kit';
import { chapterProgress } from '../chapter-tree';
import { type Chapter, curriculum } from '../curriculum';
import { difficultyRank } from '../difficulty';
import { buildTopicTree, type TopicNode } from '../topic-tree';
import { topicLabel } from '../topics';
import type { GraphNode } from './model';

export type Progress = Record<ExerciseId, ExerciseProgress>;

const CHAPTER = 'chapter:';
const TOPIC = 'topic:';
const EXERCISE = 'exercise:';

interface Draft
  extends Omit<
    GraphNode,
    'requires' | 'externalPrerequisites' | 'children' | 'step' | 'next' | 'onNextPath'
  > {
  prerequisites: Prerequisite[];
  children: Draft[];
}

interface Prerequisite {
  id: string;
  label: string;
}

interface Totals {
  passed: number;
  total: number;
}

export function unifiedGraph(
  modules: ExerciseModule[],
  progress: Progress,
  language: Language
): GraphNode[] {
  const chapters = chapterTotals(progress);
  const claimed = claimedExerciseIds();
  const looseRoots = buildTopicTree(modules.filter((module) => !claimed.has(module.definition.id)));
  const topics = topicTotals(looseRoots, progress);

  return scope([
    ...curriculum.map((chapter) => chapterDraft(chapter, modules, progress, chapters, language)),
    ...looseRoots.map((node) => topicDraft(node, progress, topics, language))
  ]);
}

export function chapterGraph(
  chapter: Chapter,
  modules: ExerciseModule[],
  progress: Progress,
  language: Language
): GraphNode[] {
  const totals = chapterTotals(progress);
  return scope([
    ...chapter.children.map((child) => chapterDraft(child, modules, progress, totals, language)),
    ...exerciseDrafts(chapter.exerciseIds, modules, progress, language)
  ]);
}

function claimedExerciseIds(): Set<string> {
  const ids = new Set<string>();
  function walk(chapters: Chapter[]): void {
    for (const chapter of chapters) {
      for (const id of chapter.exerciseIds) {
        ids.add(id);
      }
      walk(chapter.children);
    }
  }
  walk(curriculum);
  return ids;
}

function chapterDraft(
  chapter: Chapter,
  modules: ExerciseModule[],
  progress: Progress,
  totals: Map<string, Totals>,
  language: Language
): Draft {
  const own = chapterProgress(chapter, progress);
  const prerequisites = (chapter.requires ?? []).map((id) => ({
    id: CHAPTER + id,
    label: findChapter(id)?.title ?? id
  }));

  return {
    id: CHAPTER + chapter.id,
    label: chapter.title,
    kind: 'chapter',
    prerequisites,
    blocked: (chapter.requires ?? []).some((id) => isOpen(totals.get(id))),
    children: [
      ...chapter.children.map((child) => chapterDraft(child, modules, progress, totals, language)),
      ...exerciseDrafts(chapter.exerciseIds, modules, progress, language)
    ],
    passedExercises: own.passedExercises,
    totalExercises: own.totalExercises,
    ...(chapter.summary !== undefined ? { summary: chapter.summary } : {}),
    iconKey: chapter.id,
    target: { kind: 'guided', chapterId: chapter.id }
  };
}

function topicDraft(
  node: TopicNode,
  progress: Progress,
  totals: Map<string, Totals>,
  language: Language
): Draft {
  const own = totals.get(node.key) ?? { passed: 0, total: 0 };

  return {
    id: TOPIC + node.key,
    label: node.label,
    kind: 'folder',
    prerequisites: node.requires.map((key) => ({
      id: TOPIC + key,
      label: topicLabel(key.split('/'))
    })),
    blocked: node.requires.some((key) => isOpen(totals.get(key))),
    children: [
      ...node.children.map((child) => topicDraft(child, progress, totals, language)),
      ...sortByDifficulty(node.exercises, language).map((module) =>
        exerciseDraft(module, progress, language)
      )
    ],
    passedExercises: own.passed,
    totalExercises: own.total,
    ...(node.summary !== undefined ? { summary: node.summary } : {})
  };
}

function exerciseDrafts(
  exerciseIds: string[],
  modules: ExerciseModule[],
  progress: Progress,
  language: Language
): Draft[] {
  const found = exerciseIds
    .map((id) => modules.find((module) => module.definition.id === id))
    .filter((module): module is ExerciseModule => module !== undefined);
  return sortByDifficulty(found, language).map((module) =>
    exerciseDraft(module, progress, language)
  );
}

function exerciseDraft(module: ExerciseModule, progress: Progress, language: Language): Draft {
  const { id, title, difficulty, topic, tags } = module.definition;
  return {
    id: EXERCISE + id,
    label: localize(title, language),
    kind: 'exercise',
    prerequisites: [],
    blocked: false,
    children: [],
    passedExercises: progress[id]?.passed ? 1 : 0,
    totalExercises: 1,
    difficulty,
    tags,
    ...(topic.length > 0
      ? { topicPath: topic.map((_, i) => topicLabel(topic.slice(0, i + 1))) }
      : {}),
    target: { kind: 'exercise', id }
  };
}

function scope(drafts: Draft[]): GraphNode[] {
  const present = new Set<string>();
  function collect(nodes: Draft[]): void {
    for (const node of nodes) {
      present.add(node.id);
      collect(node.children);
    }
  }
  collect(drafts);

  function convert(draft: Draft, step: number): GraphNode {
    const { prerequisites, children, ...rest } = draft;
    return {
      ...rest,
      step,
      requires: prerequisites.filter((entry) => present.has(entry.id)).map((entry) => entry.id),
      externalPrerequisites: prerequisites
        .filter((entry) => !present.has(entry.id))
        .map((entry) => entry.label),
      children: inLearningOrder(children).map((child, index) => convert(child, index + 1))
    };
  }

  const roots = inLearningOrder(drafts).map((draft, index) => convert(draft, index + 1));
  markNextUp(roots);
  return roots;
}

function inLearningOrder(drafts: Draft[]): Draft[] {
  const byId = new Map(drafts.map((draft) => [draft.id, draft]));
  const depths = new Map<string, number>();
  const visiting = new Set<string>();

  function depthOf(draft: Draft): number {
    const known = depths.get(draft.id);
    if (known !== undefined) {
      return known;
    }
    if (visiting.has(draft.id)) {
      return 0;
    }

    visiting.add(draft.id);
    let depth = 0;
    for (const prerequisite of draft.prerequisites) {
      const sibling = byId.get(prerequisite.id);
      if (sibling) {
        depth = Math.max(depth, depthOf(sibling) + 1);
      }
    }
    visiting.delete(draft.id);

    depths.set(draft.id, depth);
    return depth;
  }

  return drafts
    .map((draft, index) => ({ draft, index, depth: depthOf(draft) }))
    .sort((a, b) => a.depth - b.depth || a.index - b.index)
    .map((entry) => entry.draft);
}

function markNextUp(roots: GraphNode[]): boolean {
  for (const node of roots) {
    if (node.kind === 'exercise') {
      if (node.passedExercises === 0) {
        node.next = true;
        return true;
      }
      continue;
    }
    if (markNextUp(node.children)) {
      node.onNextPath = true;
      return true;
    }
  }
  return false;
}

function isOpen(totals: Totals | undefined): boolean {
  return totals !== undefined && totals.total > 0 && totals.passed < totals.total;
}

function chapterTotals(progress: Progress): Map<string, Totals> {
  const totals = new Map<string, Totals>();
  function walk(chapters: Chapter[]): void {
    for (const chapter of chapters) {
      const own = chapterProgress(chapter, progress);
      totals.set(chapter.id, { passed: own.passedExercises, total: own.totalExercises });
      walk(chapter.children);
    }
  }
  walk(curriculum);
  return totals;
}

function topicTotals(roots: TopicNode[], progress: Progress): Map<string, Totals> {
  const totals = new Map<string, Totals>();

  function walk(node: TopicNode): Totals {
    let passed = 0;
    let total = 0;
    for (const module of node.exercises) {
      total += 1;
      if (progress[module.definition.id]?.passed) {
        passed += 1;
      }
    }
    for (const child of node.children) {
      const childTotals = walk(child);
      passed += childTotals.passed;
      total += childTotals.total;
    }
    const own = { passed, total };
    totals.set(node.key, own);
    return own;
  }

  roots.forEach(walk);
  return totals;
}

function findChapter(id: string): Chapter | undefined {
  const stack = [...curriculum];
  while (stack.length > 0) {
    const chapter = stack.pop();
    if (!chapter) {
      continue;
    }
    if (chapter.id === id) {
      return chapter;
    }
    stack.push(...chapter.children);
  }
  return undefined;
}

function sortByDifficulty(modules: ExerciseModule[], language: Language): ExerciseModule[] {
  return [...modules].sort(
    (a, b) =>
      difficultyRank(a.definition.difficulty) - difficultyRank(b.definition.difficulty) ||
      localize(a.definition.title, language).localeCompare(localize(b.definition.title, language))
  );
}
