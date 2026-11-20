export interface VirtualRange {
  start: number;
  end: number;
}

export function virtualPadding(
  items: VirtualRange[],
  totalSize: number,
): { top: number; bottom: number } {
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return { top: 0, bottom: 0 };
  return { top: first.start, bottom: Math.max(0, totalSize - last.end) };
}