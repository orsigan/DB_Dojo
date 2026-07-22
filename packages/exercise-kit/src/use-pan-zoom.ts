import { useCallback, useEffect, useRef, useState } from 'react';

export interface PanZoomOptions {
  min: number;
  max: number;
  step: number;
}

export interface PanZoom {
  pan: { x: number; y: number };
  scale: number;
  dragging: boolean;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

/** Drag-to-pan plus wheel/button zoom for a viewport element. */
export function usePanZoom({ min, max, step }: PanZoomOptions): PanZoom {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  const clamp = useCallback((value: number) => Math.min(max, Math.max(min, value)), [min, max]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setScale((prev) => clamp(prev + (event.deltaY > 0 ? -step : step)));
    };
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [clamp, step]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      dragStart.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
      setDragging(true);

      const handleMove = (moveEvent: PointerEvent) => {
        setPan({
          x: dragStart.current.panX + (moveEvent.clientX - dragStart.current.x),
          y: dragStart.current.panY + (moveEvent.clientY - dragStart.current.y)
        });
      };
      const handleUp = () => {
        setDragging(false);
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };

      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [pan.x, pan.y]
  );

  const zoomIn = useCallback(() => setScale((prev) => clamp(prev + step)), [clamp, step]);
  const zoomOut = useCallback(() => setScale((prev) => clamp(prev - step)), [clamp, step]);
  const reset = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return { pan, scale, dragging, viewportRef, onPointerDown, zoomIn, zoomOut, reset };
}
