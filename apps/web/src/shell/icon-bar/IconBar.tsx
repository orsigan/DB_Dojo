import { useEffect, useRef, useState } from 'react';
import type { IconBarItemConfig } from './types';

export function IconBar({ items }: { items: IconBarItemConfig[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openId) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpenId(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenId(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openId]);

  return (
    <div className="icon-bar" ref={rootRef}>
      {items.map((item) => {
        const isOpen = item.id === openId;
        return (
          <div className="icon-bar-item" key={item.id}>
            <button
              type="button"
              className={isOpen ? 'icon-bar-trigger active' : 'icon-bar-trigger'}
              aria-label={item.label}
              aria-haspopup="true"
              aria-expanded={isOpen}
              onClick={() => setOpenId(isOpen ? null : item.id)}
            >
              {item.icon}
            </button>
            {isOpen && (
              <div className={`icon-bar-panel icon-bar-panel-${item.align ?? 'end'}`}>
                {item.panel(() => setOpenId(null))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
