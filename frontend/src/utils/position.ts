export function calculateNewPosition(
  prevTask?: { position: number },
  nextTask?: { position: number }
): number {
  const DEFAULT_GAP = 1000;

  if (!prevTask && !nextTask) return DEFAULT_GAP;
  if (!prevTask && nextTask) return nextTask.position / 2;
  if (prevTask && !nextTask) return prevTask.position + DEFAULT_GAP;
  if (prevTask && nextTask) return (prevTask.position + nextTask.position) / 2;

  return DEFAULT_GAP;
}
