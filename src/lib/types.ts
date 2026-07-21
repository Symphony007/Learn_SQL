/**
 * Core content model types for QueryLab.
 */

export interface TableFixture {
  name: string;
  create_sql: string;
  insert_sql: string;
  columns: { name: string; type: string }[];
}

export interface Question {
  id: string;
  prompt: string;
  /** Only present if this question needs its own table(s), overrides topic's shared_table. */
  fixture?: { tables: TableFixture[] };
  expected_result: Record<string, unknown>[];
  order_sensitive: boolean;
}

export interface Topic {
  topic_id: string;
  title: string;
  order: number;
  theory: {
    concept: string;
    syntax: string;
    example: {
      query: string;
      explanation: string;
    };
    common_mistakes: string[];
  };
  /** null if every question brings its own fixture. Can be an array if multiple shared tables. */
  shared_table: TableFixture | TableFixture[] | null;
  questions: Question[];
}
