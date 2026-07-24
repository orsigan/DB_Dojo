import { useCallback, useRef, useState } from 'react';

export function useDragResize({
  axis,
  value,
  onChange,
  onDragEnd,
  min,
  max,
  step = 10
}: {
  axis: 'horizontal' | 'vertical';
  value: number;
  onChange: (next: number) => void;
  onDragEnd?: ((finalValue: number) => void) | undefined;
  min: number;
  max: number;
  step?: number;
}) {
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef({ pos: 0, value: 0 });
  const lastValue = useRef(value);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      dragStart.current = { pos: axis === 'horizontal' ? event.clientX : event.clientY, value };
      lastValue.current = value;
      setResizing(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = axis === 'horizontal' ? 'col-resize' : 'row-resize';

      const handleMove = (moveEvent: PointerEvent) => {
        const pos = axis === 'horizontal' ? moveEvent.clientX : moveEvent.clientY;
        const delta = pos - dragStart.current.pos;
        const next = Math.min(max, Math.max(min, dragStart.current.value + delta));
        lastValue.current = next;
        onChange(next);
      };

      const handleUp = () => {
        setResizing(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
        onDragEnd?.(lastValue.current);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [axis, value, onChange, onDragEnd, min, max]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const amount = event.shiftKey ? step * 4 : step;
      const forwardKey = axis === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
      const backwardKey = axis === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      if (event.key === forwardKey) {
        event.preventDefault();
        const next = Math.min(max, value + amount);
        onChange(next);
        onDragEnd?.(next);
      } else if (event.key === backwardKey) {
        event.preventDefault();
        const next = Math.max(min, value - amount);
        onChange(next);
        onDragEnd?.(next);
      }
    },
    [axis, value, onChange, onDragEnd, min, max, step]
  );

  return { resizing, handlePointerDown, handleKeyDown };
}
