import { useCallback, useRef, useState } from 'react';

export const MIN_SIDEBAR_WIDTH = 180;
export const MAX_SIDEBAR_WIDTH = 480;

/** Drag-to-resize plus arrow-key stepping for the sidebar splitter, clamped to its width bounds. */
export function useSidebarResize(
  width: number,
  setWidth: (update: (prev: number) => number) => void
) {
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef({ x: 0, width: 0 });

  const handleResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      dragStart.current = { x: event.clientX, width };
      setResizing(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';

      const handleMove = (moveEvent: PointerEvent) => {
        const delta = moveEvent.clientX - dragStart.current.x;
        const next = Math.min(
          MAX_SIDEBAR_WIDTH,
          Math.max(MIN_SIDEBAR_WIDTH, dragStart.current.width + delta)
        );
        setWidth(() => next);
      };

      const handleUp = () => {
        setResizing(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [width, setWidth]
  );

  const handleResizeKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const step = event.shiftKey ? 40 : 10;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setWidth((prev) => Math.max(MIN_SIDEBAR_WIDTH, prev - step));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setWidth((prev) => Math.min(MAX_SIDEBAR_WIDTH, prev + step));
      }
    },
    [setWidth]
  );

  return { resizing, handleResizeStart, handleResizeKeyDown };
}
