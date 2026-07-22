import { useRef, useState } from 'react';

export interface WindowDragSourceHandlers {
  draggable: true;
  onDragStart: (event: React.DragEvent) => void;
  onDragEnd: () => void;
}

export interface WindowDragTargetHandlers {
  onDragEnter: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

export function useWindowSwapDrag<Id extends string>(onSwap: (a: Id, b: Id) => void) {
  const [draggedId, setDraggedId] = useState<Id | null>(null);
  const [dragOverId, setDragOverId] = useState<Id | null>(null);
  const enterCounts = useRef(new Map<Id, number>());

  function dragSourceHandlers(id: Id): WindowDragSourceHandlers {
    return {
      draggable: true,
      onDragStart: (event) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', id);
        setDraggedId(id);
      },
      onDragEnd: () => {
        enterCounts.current.clear();
        setDraggedId(null);
        setDragOverId(null);
      }
    };
  }

  function dragTargetHandlers(id: Id): WindowDragTargetHandlers {
    return {
      onDragEnter: (event) => {
        if (draggedId && draggedId !== id) {
          event.preventDefault();
          enterCounts.current.set(id, (enterCounts.current.get(id) ?? 0) + 1);
          setDragOverId(id);
        }
      },
      onDragOver: (event) => {
        if (draggedId && draggedId !== id) {
          event.preventDefault();
        }
      },
      onDragLeave: () => {
        const remaining = (enterCounts.current.get(id) ?? 0) - 1;
        if (remaining <= 0) {
          enterCounts.current.delete(id);
          setDragOverId((current) => (current === id ? null : current));
        } else {
          enterCounts.current.set(id, remaining);
        }
      },
      onDrop: (event) => {
        event.preventDefault();
        enterCounts.current.delete(id);
        if (draggedId && draggedId !== id) {
          onSwap(draggedId, id);
        }
        setDraggedId(null);
        setDragOverId(null);
      }
    };
  }

  return { dragSourceHandlers, dragTargetHandlers, draggedId, dragOverId };
}
