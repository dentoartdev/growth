// One-time import of the 312 posts + insights already pulled on 2026-08-06, so the app has
// history from day one. Reads the old database READ-ONLY. Safe to re-run.
import { DatabaseSync } from "node:sqlite";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const SRC = path.resolve(root, "../content-os/data/content-os.db");
const ARCHIVE = path.resolve(root, "../smile-library/reference");
const OUT = path.join(root, "data", "growth.db");
fs.mkdirSync(path.dirname(OUT), { recursive: true });

const src = new DatabaseSync(SRC, { readOnly: true });
const dst = new DatabaseSync(OUT);
dst.exec(`CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY, caption TEXT, media_type TEXT, permalink TEXT, thumb TEXT, posted_at TEXT,
  likes INTEGER DEFAULT 0, comments INTEGER DEFAULT 0, reach INTEGER DEFAULT 0, views INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0, shares INTEGER DEFAULT 0, interactions INTEGER DEFAULT 0, synced_at TEXT);
  CREATE TABLE IF NOT EXISTS account_snapshots (day TEXT PRIMARY KEY, followers INTEGER, follows INTEGER, media_count INTEGER);`);

// Index local archive images by media id (filenames are the Instagram media id).
const files = new Map();
const walk = (dir) => { for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
  const p = path.join(dir, f.name);
  if (f.isDirectory()) walk(p); else if (/\.(jpe?g|png)$/i.test(f.name)) files.set(f.name.replace(/\.\w+$/, ""), p);
} };
if (fs.existsSync(ARCHIVE)) walk(ARCHIVE);

const thumbDir = path.join(root, "public", "thumbs");
fs.mkdirSync(thumbDir, { recursive: true });

const media = src.prepare("SELECT * FROM instagram_media").all();
const ins = src.prepare("SELECT metric, value FROM instagram_media_insights WHERE ig_media_id = ?");
const up = dst.prepare(`INSERT INTO posts (id, caption, media_type, permalink, thumb, posted_at, likes, comments, reach, views, saves, shares, interactions, synced_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET reach=excluded.reach, views=excluded.views,
  saves=excluded.saves, shares=excluded.shares, interactions=excluded.interactions, thumb=COALESCE(excluded.thumb, posts.thumb)`);

let thumbs = 0;
for (const m of media) {
  const v = Object.fromEntries(ins.all(m.ig_media_id).map((r) => [r.metric, Number(r.value) || 0]));
  let thumb = null;
  const file = files.get(m.ig_media_id);
  if (file) {
    const out = path.join(thumbDir, `${m.ig_media_id}.jpg`);
    if (!fs.existsSync(out)) execFileSync("sips", ["-s", "format", "jpeg", "-Z", "480", file, "--out", out], { stdio: "ignore" });
    thumb = `/thumbs/${m.ig_media_id}.jpg`;
    thumbs++;
  }
  up.run(m.ig_media_id, m.caption, m.media_type, m.permalink, thumb, m.posted_at, v.likes ?? m.like_count ?? 0,
    v.comments ?? m.comments_count ?? 0, v.reach ?? 0, v.views ?? 0, v.saved ?? 0, v.shares ?? 0, v.total_interactions ?? 0, m.last_synced_at);
}
dst.prepare("INSERT OR IGNORE INTO account_snapshots (day, followers, follows, media_count) VALUES ('2026-08-06', 15652, 2275, 317)").run();
console.log(`Imported ${media.length} posts, ${thumbs} with local thumbnails.`);
