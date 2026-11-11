import "server-only";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// One small local database. Every table the app needs lives here.
const FILE = process.env.GROWTH_DB_PATH || path.join(process.cwd(), "data", "growth.db");

let _db: DatabaseSync | null = null;

export function db(): DatabaseSync {
  if (_db) return _db;
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const d = new DatabaseSync(FILE);
  d.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY, caption TEXT, media_type TEXT, permalink TEXT, thumb TEXT,
      posted_at TEXT, likes INTEGER DEFAULT 0, comments INTEGER DEFAULT 0, reach INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0, saves INTEGER DEFAULT 0, shares INTEGER DEFAULT 0,
      interactions INTEGER DEFAULT 0, synced_at TEXT
    );
    CREATE TABLE IF NOT EXISTS account_snapshots (
      day TEXT PRIMARY KEY, followers INTEGER, follows INTEGER, media_count INTEGER
    );
    CREATE TABLE IF NOT EXISTS plan_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, day TEXT NOT NULL, slot TEXT NOT NULL,
      format TEXT NOT NULL, pillar TEXT NOT NULL, title TEXT NOT NULL, hook TEXT, caption TEXT,
      cta TEXT, best_time TEXT, status TEXT NOT NULL DEFAULT 'idea', notes TEXT
    );
    CREATE TABLE IF NOT EXISTS ads (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, goal TEXT NOT NULL,
      start_day TEXT, end_day TEXT, daily_budget REAL DEFAULT 0, spend REAL DEFAULT 0,
      reach INTEGER DEFAULT 0, clicks INTEGER DEFAULT 0, messages INTEGER DEFAULT 0,
      new_clients INTEGER DEFAULT 0, status TEXT NOT NULL DEFAULT 'planned', notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS task_checks (day TEXT NOT NULL, task TEXT NOT NULL, PRIMARY KEY (day, task));
    CREATE TABLE IF NOT EXISTS sync_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, ok INTEGER NOT NULL, message TEXT
    );
  `);
  _db = d;
  return d;
}

export function getSetting(key: string): string | null {
  const r = db().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return r?.value ?? null;
}

export function setSetting(key: string, value: string | null) {
  if (value === null) db().prepare("DELETE FROM settings WHERE key = ?").run(key);
  else db().prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(key, value);
}

export type Post = {
  id: string; caption: string | null; media_type: string; permalink: string | null; thumb: string | null;
  posted_at: string; likes: number; comments: number; reach: number; views: number; saves: number;
  shares: number; interactions: number;
};

export function allPosts(): Post[] {
  return db().prepare("SELECT * FROM posts ORDER BY posted_at DESC").all() as unknown as Post[];
}
