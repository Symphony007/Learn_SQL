/**
 * Result differ for comparing actual query output against expected output.
 *
 * Supports both order-sensitive and order-insensitive comparison.
 * Returns a human-readable diff description when there's a mismatch.
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
 * Column order doesn't matter (each row is compared as an object).
 * When `orderSensitive` is true, rows must match in sequence.
 * When false, both arrays are canonically sorted before comparison.
 */
export function diffResults(
  actual: Record<string, unknown>[],
  expected: Record<string, unknown>[],
  orderSensitive: boolean = true,
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

  // ── Sort if order-insensitive ──────────────────────────────────────────
  const actualRows = orderSensitive ? actual : canonicalSort(actual);
  const expectedRows = orderSensitive ? expected : canonicalSort(expected);

  // ── Row-by-row comparison ──────────────────────────────────────────────
  for (let i = 0; i < expectedRows.length; i++) {
    const expRow = expectedRows[i];
    const actRow = actualRows[i];

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
 * Returns a sorted copy of rows, using a canonical string key for each row.
 * This enables order-insensitive comparison.
 */
function canonicalSort(
  rows: Record<string, unknown>[],
): Record<string, unknown>[] {
  return [...rows].sort((a, b) => {
    const aKey = JSON.stringify(
      Object.entries(a)
        .map(([k, v]) => [k, normalise(v)])
        .sort(([k1], [k2]) => k1.localeCompare(k2)),
    );
    const bKey = JSON.stringify(
      Object.entries(b)
        .map(([k, v]) => [k, normalise(v)])
        .sort(([k1], [k2]) => k1.localeCompare(k2)),
    );
    return aKey.localeCompare(bKey);
  });
}

/**
 * Normalises a cell value so comparisons are type-agnostic.
 * sql.js may return numbers, strings, null, or Uint8Array (BLOBs).
 * We convert everything to a string for comparison.
 */
function normalise(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  return String(value);
}
