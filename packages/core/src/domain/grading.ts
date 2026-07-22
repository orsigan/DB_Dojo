import type { LocalizedText } from './localized-text';

export type GradingSpec = ResultEqualsSpec | AssertionsSpec;

export interface ResultEqualsSpec {
  kind: 'result-equals';
  expectedSql: string;
  ordered?: boolean;
}

export interface AssertionsSpec {
  kind: 'assertions';
  checks: AssertionCheck[];
}

export interface AssertionCheck {
  label: LocalizedText;
  sql: string;
}
