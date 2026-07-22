import type { Language } from '@db-dojo/core';
import { useEffect, useState } from 'react';
import type { ExerciseHostApi } from '../contract';
import { t } from '../strings';
import { type ExplainCost, type ExplainNode, parseExplainPlan } from './explain-plan';

const EXPLAINABLE_KEYWORDS = ['SELECT', 'WITH', 'VALUES', 'TABLE', 'INSERT', 'UPDATE', 'DELETE'];
const SAFE_TO_ANALYZE_KEYWORDS = ['SELECT', 'WITH', 'VALUES', 'TABLE'];

function leadingKeyword(sql: string): string {
  return sql.trim().split(/\s+/)[0]?.toUpperCase() ?? '';
}

function isExplainable(sql: string): boolean {
  return EXPLAINABLE_KEYWORDS.includes(leadingKeyword(sql));
}

function explainCommand(sql: string): string {
  return SAFE_TO_ANALYZE_KEYWORDS.includes(leadingKeyword(sql)) ? 'EXPLAIN ANALYZE' : 'EXPLAIN';
}

function formatCost(cost: ExplainCost): string {
  return `${cost.startup}..${cost.total}`;
}

function ExplainTreeNode({ node, language }: { node: ExplainNode; language: Language }) {
  return (
    <li className="explain-plan-tree-node">
      <div className="explain-plan-tree-label">{node.label}</div>
      <div className="explain-plan-tree-metrics">
        {node.cost && (
          <span className="explain-plan-tree-metric">
            {t('explainCost', language)}: {formatCost(node.cost)}
          </span>
        )}
        {node.rows !== undefined && (
          <span className="explain-plan-tree-metric">
            {t('explainRows', language)}: {node.rows}
          </span>
        )}
        {node.actualTime && (
          <span className="explain-plan-tree-metric">
            {t('explainActualTime', language)}: {formatCost(node.actualTime)} ms
          </span>
        )}
        {node.actualRows !== undefined && (
          <span className="explain-plan-tree-metric">
            {t('explainActualRows', language)}: {node.actualRows}
          </span>
        )}
      </div>
      {node.details.length > 0 && (
        <ul className="explain-plan-tree-notes">
          {node.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
      {node.children.length > 0 && (
        <ul className="explain-plan-tree-children">
          {node.children.map((child) => (
            <ExplainTreeNode key={child.id} node={child} language={language} />
          ))}
        </ul>
      )}
    </li>
  );
}

function ExplainTree({ root, language }: { root: ExplainNode; language: Language }) {
  return (
    <ul className="explain-plan-tree">
      <ExplainTreeNode node={root} language={language} />
    </ul>
  );
}

export function ExplainPanel({
  host,
  sql,
  language
}: {
  host: ExerciseHostApi;
  sql: string;
  language: Language;
}) {
  const [plan, setPlan] = useState<string[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const explainable = isExplainable(sql);

  // biome-ignore lint/correctness/useExhaustiveDependencies: sql is a reset trigger, not read in the body
  useEffect(() => {
    setPlan(null);
    setExpanded(false);
    setError(null);
  }, [sql]);

  const explain = async () => {
    if (plan) {
      setExpanded((value) => !value);
      return;
    }
    setBusy(true);
    setError(null);
    const outcome = await host.runSql(`${explainCommand(sql)} ${sql}`);
    if (outcome.success) {
      setPlan(outcome.value.rows.map((row) => String(Object.values(row)[0])));
      setExpanded(true);
    } else {
      setPlan(null);
      setError(outcome.error.message);
    }
    setBusy(false);
  };

  return (
    <div className="explain-panel">
      <button
        type="button"
        className="ghost"
        onClick={explain}
        disabled={busy || !explainable}
        title={explainable ? undefined : t('explainDisabledHint', language)}
      >
        {t('explain', language)}
      </button>

      {error && <p className="error">{error}</p>}

      {expanded && plan && <ExplainResult plan={plan} language={language} />}
    </div>
  );
}

function ExplainResult({ plan, language }: { plan: string[]; language: Language }) {
  let planTree: ExplainNode | null = null;
  try {
    planTree = parseExplainPlan(plan);
  } catch {
    planTree = null;
  }

  if (!planTree) {
    return <pre className="explain-plan">{plan.join('\n')}</pre>;
  }

  return <ExplainTree root={planTree} language={language} />;
}
