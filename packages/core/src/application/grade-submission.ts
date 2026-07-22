import type { Exercise } from '../domain/exercise';
import type { AssertionsSpec, ResultEqualsSpec } from '../domain/grading';
import { type Language, type LocalizedText, localize } from '../domain/localized-text';
import type { Verdict } from '../domain/verdict';
import type { DatabaseEngine, Row } from './ports/database-engine';

const MESSAGES = {
  resultMatches: {
    de: 'Ergebnis stimmt mit dem erwarteten Ergebnis überein.',
    en: 'Result matches the expected output.'
  },
  resultDiffers: {
    de: 'Ergebnis weicht vom erwarteten Ergebnis ab.',
    en: 'Result differs from the expected output.'
  },
  referenceQueryFailed: {
    de: 'Die Referenzabfrage konnte nicht ausgewertet werden.',
    en: 'Could not evaluate the reference query.'
  }
} satisfies Record<string, LocalizedText>;

export async function gradeSubmission(
  engine: DatabaseEngine,
  exercise: Exercise,
  userSql: string,
  language: Language
): Promise<Verdict> {
  const grading = exercise.grading;

  if (grading.kind === 'result-equals') {
    return gradeByResult(engine, grading, userSql, language);
  }

  return gradeByAssertions(engine, grading, userSql, language);
}

async function gradeByResult(
  engine: DatabaseEngine,
  grading: ResultEqualsSpec,
  userSql: string,
  language: Language
): Promise<Verdict> {
  const actual = await engine.run(userSql);
  if (!actual.success) {
    return { passed: false, feedback: [actual.error.message] };
  }

  const expected = await engine.run(grading.expectedSql);
  if (!expected.success) {
    return { passed: false, feedback: [localize(MESSAGES.referenceQueryFailed, language)] };
  }

  const passed =
    fingerprint(actual.value.rows, grading.ordered) ===
    fingerprint(expected.value.rows, grading.ordered);

  return {
    passed,
    feedback: [localize(passed ? MESSAGES.resultMatches : MESSAGES.resultDiffers, language)]
  };
}

async function gradeByAssertions(
  engine: DatabaseEngine,
  grading: AssertionsSpec,
  userSql: string,
  language: Language
): Promise<Verdict> {
  const applied = await engine.exec(userSql);
  if (!applied.success) {
    return { passed: false, feedback: [applied.error.message] };
  }

  const feedback: string[] = [];
  let passed = true;

  for (const check of grading.checks) {
    const result = await engine.run(check.sql);
    const checkPassed = result.success && result.value.rows[0]?.['ok'] === true;
    if (!checkPassed) {
      passed = false;
    }
    feedback.push(`${checkPassed ? 'PASS' : 'FAIL'} — ${localize(check.label, language)}`);
  }

  return { passed, feedback };
}

function fingerprint(rows: Row[], ordered?: boolean): string {
  const lines = rows.map((row) => JSON.stringify(row));
  if (!ordered) {
    lines.sort();
  }
  return JSON.stringify(lines);
}
