import { type Hint, type Language, localize } from '@db-dojo/core';
import { t } from '../strings';

export function HintList({ hints, language }: { hints: Hint[]; language: Language }) {
  if (hints.length === 0) {
    return null;
  }

  return (
    <div className="hints">
      {hints.map((hint, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: hints have no stable id and the list is static
        <details key={index} className="hint">
          <summary>
            {t('hint', language)} {index + 1}
          </summary>
          <p>{localize(hint.text, language)}</p>
        </details>
      ))}
    </div>
  );
}
