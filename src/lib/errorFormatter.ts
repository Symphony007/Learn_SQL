/**
 * Error formatter for sql.js errors.
 *
 * Parses raw SQLite error messages and attempts to provide helpful
 * suggestions using Levenshtein-distance fuzzy matching against known
 * table/column names, plus a small lookup table of common SQL keyword typos.
 */

// ── Levenshtein distance ────────────────────────────────────────────────────

function levenshtein(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  const dp: number[][] = Array.from({ length: la + 1 }, () =>
    Array(lb + 1).fill(0),
  );

  for (let i = 0; i <= la; i++) dp[i][0] = i;
  for (let j = 0; j <= lb; j++) dp[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return dp[la][lb];
}

/**
 * Returns the closest match from `candidates` whose Levenshtein distance to
 * `target` is at most `maxDistance`. Returns `null` if nothing is close enough.
 */
function closestMatch(
  target: string,
  candidates: string[],
  maxDistance = 3,
): string | null {
  let best: string | null = null;
  let bestDist = Infinity;

  for (const c of candidates) {
    const d = levenshtein(target, c);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }

  return bestDist <= maxDistance ? best : null;
}

// ── Common SQL keyword typos ────────────────────────────────────────────────

const KEYWORD_TYPOS: Record<string, string> = {
  FRM: "FROM",
  FORM: "FROM",
  FRON: "FROM",
  FROMT: "FROM",
  SLECT: "SELECT",
  SELCT: "SELECT",
  SELET: "SELECT",
  SELEC: "SELECT",
  WHER: "WHERE",
  WHRE: "WHERE",
  WEHRE: "WHERE",
  GROUPBY: "GROUP BY",
  GROPU: "GROUP",
  ORDR: "ORDER",
  ORDERY: "ORDER",
  ODERBY: "ORDER BY",
  ODER: "ORDER",
  LIMI: "LIMIT",
  INSER: "INSERT",
  INSRT: "INSERT",
  UDPATE: "UPDATE",
  UPDAT: "UPDATE",
  DELET: "DELETE",
  DELECT: "DELETE",
};

// ── Public API ──────────────────────────────────────────────────────────────

export interface FormattedError {
  /** The enhanced message (or the original one if no pattern matched). */
  message: string;
  /** The original raw error message from sql.js / SQLite. */
  raw: string;
}

/**
 * Takes a raw sql.js error and returns a friendlier message when possible.
 *
 * @param err       The error thrown by sql.js (typically an `Error`).
 * @param tables    Known table names in the current database.
 * @param columns   Known column names (flat list across all tables).
 */
export function formatSqlError(
  err: unknown,
  tables: string[],
  columns: string[],
): FormattedError {
  const raw = err instanceof Error ? err.message : String(err);

  // Pattern 1 — "no such table: X"
  const tableMatch = raw.match(/no such table:\s*(\S+)/i);
  if (tableMatch) {
    const unknown = tableMatch[1];
    const suggestion = closestMatch(unknown, tables);
    const message = suggestion
      ? `No table called '${unknown}'. Did you mean '${suggestion}'?`
      : `No table called '${unknown}'.`;
    return { message, raw };
  }

  // Pattern 2 — "no such column: X"  (sometimes includes table prefix)
  const colMatch = raw.match(/no such column:\s*(?:\S+\.)?(\S+)/i);
  if (colMatch) {
    const unknown = colMatch[1];
    const suggestion = closestMatch(unknown, columns);
    const message = suggestion
      ? `No column called '${unknown}'. Did you mean '${suggestion}'?`
      : `No column called '${unknown}'.`;
    return { message, raw };
  }

  // Pattern 3 — 'near "X": syntax error'
  const syntaxMatch = raw.match(/near\s+"([^"]+)":\s*syntax error/i);
  if (syntaxMatch) {
    const token = syntaxMatch[1].toUpperCase();
    const fix = KEYWORD_TYPOS[token];
    if (fix) {
      return {
        message: `Syntax error near '${syntaxMatch[1]}'. Did you mean '${fix}'?`,
        raw,
      };
    }
    // No known typo — pass through SQLite's own message
    return { message: raw, raw };
  }

  // Default — pass through
  return { message: raw, raw };
}
