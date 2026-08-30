export function calculateNewPosition(
  prev?: number,
  next?: number
): number {
  const DEFAULT_GAP = 1000;

  if (!prev && !next) return DEFAULT_GAP;
  if (!prev && next) return next / 2;
  if (prev && !next) return prev + DEFAULT_GAP;
  if (prev && next) return (prev + next) / 2;

  return DEFAULT_GAP;
}
