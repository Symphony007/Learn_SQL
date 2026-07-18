/**
 * Content loader for topic JSON files.
 *
 * Reads /content/topics/*.json at build/request time (server components only).
 */

import fs from "fs";
import path from "path";
import type { Topic } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content", "topics");

/**
 * Returns all topics sorted by their `order` field.
 * Used by the topic list / roadmap page.
 */
export function getAllTopics(): Topic[] {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".json"));

  const topics: Topic[] = files.map((f) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, f), "utf-8");
    return JSON.parse(raw) as Topic;
  });

  return topics.sort((a, b) => a.order - b.order);
}

/**
 * Returns a single topic by its topic_id, or null if not found.
 * Used by the topic detail page.
 */
export function getTopicById(topicId: string): Topic | null {
  const topics = getAllTopics();
  return topics.find((t) => t.topic_id === topicId) ?? null;
}
