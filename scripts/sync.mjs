// Daily sync, run by GitHub Actions. Reads INSTAGRAM_ACCESS_TOKEN from the environment (a GitHub
// secret), pulls the profile + posts + insights, saves new thumbnails, and rewrites public/data.json.
// It never prints the token. If the token is missing or broken it keeps the old data and exits 0,
// so the site still publishes.
import fs from "node:fs";
import path from "node:path";

const GRAPH = "https://graph.instagram.com/v23.0";
const EXPECTED = "dentoart.dubai";
const root = path.resolve(import.meta.dirname, "..");
const FILE = path.join(root, "public", "data.json");
const THUMBS = path.join(root, "public", "thumbs");
const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();

const old = JSON.parse(fs.readFileSync(FILE, "utf8"));
const save = (d) => fs.writeFileSync(FILE, JSON.stringify(d));

async function get(p) {
  const url = `${GRAPH}${p}${p.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`;
  const r = await fetch(url);
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error?.message || `HTTP ${r.status}`);
  return j;
}

if (!token) {
  console.log("No INSTAGRAM_ACCESS_TOKEN secret yet — keeping existing data.");
  save({ ...old, live: false });
  process.exit(0);
}

try {
  const me = await get("/me?fields=username,followers_count,follows_count,media_count");
  if (me.username !== EXPECTED) throw new Error(`Token belongs to @${me.username}, expected @${EXPECTED}`);

  // Keep long-lived tokens alive (extends expiry; harmless if not needed yet).
  await get("/refresh_access_token?grant_type=ig_refresh_token").catch(() => {});

  const byId = new Map(old.posts.map((p) => [p.id, p]));
  let next = "/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=50";
  const fresh = [];
  for (let page = 0; page < 10 && next; page++) {
    const j = await get(next);
    fresh.push(...j.data);
    next = j.paging?.next ? j.paging.next.replace(GRAPH, "").replace(/[?&]access_token=[^&]+/, "") : "";
  }

  fs.mkdirSync(THUMBS, { recursive: true });
  let newThumbs = 0, insights = 0;
  for (const [i, m] of fresh.entries()) {
    const prev = byId.get(m.id) || {};
    const p = {
      id: m.id, caption: m.caption ?? null, media_type: m.media_type, permalink: m.permalink ?? null,
      thumb: prev.thumb ?? null, posted_at: m.timestamp, likes: m.like_count ?? 0, comments: m.comments_count ?? 0,
      reach: prev.reach ?? 0, views: prev.views ?? 0, saves: prev.saves ?? 0, shares: prev.shares ?? 0,
    };
    // Save a permanent copy of the cover image (Instagram links expire).
    const src = m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
    if (!p.thumb && src) {
      try {
        const r = await fetch(src);
        if (r.ok) { fs.writeFileSync(path.join(THUMBS, `${m.id}.jpg`), Buffer.from(await r.arrayBuffer())); p.thumb = `thumbs/${m.id}.jpg`; newThumbs++; }
      } catch { /* skip */ }
    }
    // Insights for the newest 40 posts (older numbers barely change).
    if (i < 40) {
      try {
        const j = await get(`/${m.id}/insights?metric=reach,views,saved,shares`);
        const v = (n) => Number(j.data.find((x) => x.name === n)?.values?.[0]?.value || 0);
        Object.assign(p, { reach: v("reach"), views: v("views"), saves: v("saved"), shares: v("shares") });
        insights++;
      } catch { /* some posts have no insights */ }
    }
    byId.set(m.id, p);
  }

  const posts = [...byId.values()].sort((a, b) => (a.posted_at < b.posted_at ? 1 : -1));
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
  save({
    generatedAt: new Date().toISOString(), live: true,
    account: { day, followers: me.followers_count, follows: me.follows_count, media_count: me.media_count },
    posts,
  });
  console.log(`OK: ${fresh.length} posts, ${insights} with insights, ${newThumbs} new thumbnails, ${me.followers_count} followers.`);
} catch (e) {
  console.log(`Sync failed (${e.message}) — keeping existing data.`);
  save({ ...old, live: false });
}
