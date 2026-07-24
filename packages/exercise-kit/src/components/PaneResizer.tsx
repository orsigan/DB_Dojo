import { useDragResize } from '../use-drag-resize';

export function PaneResizer({
  axis,
  value,
  onChange,
  onDragEnd,
  min,
  max,
  label,
  className
}: {
  axis: 'horizontal' | 'vertical';
  value: number;
  onChange: (next: number) => void;
  onDragEnd?: ((finalValue: number) => void) | undefined;
  min: number;
  max: number;
  label: string;
  className?: string;
}) {
  const { resizing, handlePointerDown, handleKeyDown } = useDragResize({
    axis,
    value,
    onChange,
    onDragEnd,
    min,
    max
  });

  const orientationClass = axis === 'horizontal' ? 'pane-resizer-col' : 'pane-resizer-row';
  const classes = ['pane-resizer', orientationClass];
  if (resizing) {
    classes.push('resizing');
  }
  if (className) {
    classes.push(className);
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: interactive draggable splitter, not a static <hr>
    <div
      className={classes.join(' ')}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      role="separator"
      aria-orientation={axis === 'horizontal' ? 'vertical' : 'horizontal'}
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
    />
  );
}
