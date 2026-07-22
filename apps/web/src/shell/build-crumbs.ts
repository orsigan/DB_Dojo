import { localize } from '@db-dojo/core';
import { findChapterPath } from '../app/chapter-tree';
import { curriculum } from '../app/curriculum';
import { exerciseModules } from '../app/exercise-registry';
import type { useLanguage } from '../app/i18n/use-language';
import type { useTranslation } from '../app/i18n/use-translation';
import type { View } from '../app/modes/types';
import { topicLabel } from '../app/topics';

export interface Crumb {
  label: string;
  view?: View;
}

export function buildCrumbs(
  view: View,
  t: ReturnType<typeof useTranslation>['t'],
  language: ReturnType<typeof useLanguage>['language']
): Crumb[] {
  if (view.kind === 'home') {
    return [{ label: t('nav.home') }];
  }
  if (view.kind === 'free') {
    return [{ label: t('nav.free') }];
  }
  if (view.kind === 'library') {
    return [{ label: t('nav.library') }];
  }
  if (view.kind === 'stats') {
    return [{ label: t('nav.stats') }];
  }
  if (view.kind === 'settings') {
    return [{ label: t('nav.settings') }];
  }
  if (view.kind === 'history') {
    return [{ label: t('nav.history') }];
  }
  if (view.kind === 'guided') {
    const chapterPath = view.chapterId ? findChapterPath(curriculum, view.chapterId) : undefined;
    return [
      { label: t('nav.guided'), view: { kind: 'guided' } },
      ...(chapterPath ?? []).map((chapter) => ({
        label: chapter.title,
        view: { kind: 'guided', chapterId: chapter.id } satisfies View
      }))
    ];
  }

  const module = exerciseModules.find((candidate) => candidate.definition.id === view.id);
  if (!module) {
    return [{ label: t('start.exercise') }];
  }
  const topic = module.definition.topic;
  const topicCrumbs = topic.map((_, i) => ({ label: topicLabel(topic.slice(0, i + 1)) }));
  return [...topicCrumbs, { label: localize(module.definition.title, language) }];
}
