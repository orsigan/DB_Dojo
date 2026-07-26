const positions = new Map<string, number>();

export function saveScrollPosition(key: string, value: number): void {
  positions.set(key, value);
}

export function getScrollPosition(key: string): number {
  return positions.get(key) ?? 0;
}
