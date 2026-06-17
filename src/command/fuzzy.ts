// Lightweight subsequence fuzzy matcher. Returns a score (higher = better) or
// null when `query` is not a subsequence of `text`. Consecutive matches and
// word-boundary / start-of-string hits are rewarded so the ranking feels close
// to Linear's command bar without pulling in a dependency.
export function fuzzyScore(text: string, query: string): number | null {
  if (query.length === 0) return 0;
  const haystack = text.toLowerCase();
  const needle = query.toLowerCase();

  let score = 0;
  let textIndex = 0;
  let prevMatch = -2;

  for (let i = 0; i < needle.length; i++) {
    const char = needle[i];
    const found = haystack.indexOf(char, textIndex);
    if (found === -1) return null;

    score += 1;
    if (found === prevMatch + 1) score += 4; // consecutive
    if (found === 0 || /[\s\-_/]/.test(haystack[found - 1] ?? "")) score += 3; // boundary
    score -= Math.min(found - textIndex, 3); // penalize gaps lightly

    prevMatch = found;
    textIndex = found + 1;
  }
  return score;
}

