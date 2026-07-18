/**
 * Result differ for comparing actual query output against expected output.
 *
 * Performs an order-sensitive comparison (row-by-row, column-by-column) and
 * returns a human-readable diff description when there's a mismatch.
 */

export interface DiffMatch {
  match: true;
}

export interface DiffMismatch {
  match: false;
  reason: string;
}

export type DiffResult = DiffMatch | DiffMismatch;

/**
 * Compares `actual` rows against `expected` rows.
 *
 * Column order doesn't matter (each row is compared as an object), but row
 * order IS significant — because the prompt explicitly asks for ORDER BY.
 */
export function diffResults(
  actual: Record<string, unknown>[],
  expected: Record<string, unknown>[],
): DiffResult {
  // ── Row count ──────────────────────────────────────────────────────────
  if (actual.length !== expected.length) {
    return {
      match: false,
      reason: `Expected ${expected.length} row${expected.length === 1 ? "" : "s"}, got ${actual.length}.`,
    };
  }

  // ── Column names (compared as sets) ────────────────────────────────────
  if (expected.length > 0 && actual.length > 0) {
    const expectedCols = new Set(Object.keys(expected[0]));
    const actualCols = new Set(Object.keys(actual[0]));

    // Check for missing columns in actual
    for (const col of expectedCols) {
      if (!actualCols.has(col)) {
        return {
          match: false,
          reason: `Missing column '${col}' in result.`,
        };
      }
    }

    // Check for extra columns in actual
    for (const col of actualCols) {
      if (!expectedCols.has(col)) {
        return {
          match: false,
          reason: `Unexpected extra column '${col}' in result.`,
        };
      }
    }
  }

  // ── Row-by-row comparison (order-sensitive) ────────────────────────────
  for (let i = 0; i < expected.length; i++) {
    const expRow = expected[i];
    const actRow = actual[i];

    for (const col of Object.keys(expRow)) {
      const expVal = normalise(expRow[col]);
      const actVal = normalise(actRow[col]);

      if (expVal !== actVal) {
        return {
          match: false,
          reason: `Row ${i + 1} doesn't match: expected ${JSON.stringify(expRow)}, got ${JSON.stringify(actRow)}.`,
        };
      }
    }
  }

  return { match: true };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalises a cell value so comparisons are type-agnostic.
 * sql.js may return numbers, strings, null, or Uint8Array (BLOBs).
 * We convert everything to a string for comparison.
 */
function normalise(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  return String(value);
}
