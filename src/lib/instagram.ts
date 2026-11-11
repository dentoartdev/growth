import "server-only";
import { db, getSetting } from "./db";
import { dubaiDay } from "./dates";

const GRAPH = "https://graph.instagram.com/v23.0";
export const EXPECTED_USERNAME = "dentoart.dubai";

function token(): string | null {
  return process.env.INSTAGRAM_ACCESS_TOKEN || getSetting("ig_token");
}

async function get(pathAndQuery: string, tok: string) {
  const sep = pathAndQuery.includes("?") ? "&" : "?";
  const res = await fetch(`${GRAPH}${pathAndQuery}${sep}access_token=${encodeURIComponent(tok)}`, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(json.error?.message || `Instagram error ${res.status}`);
  return json;
}

export async function checkToken(tok: string) {
  const me = await get("/me?fields=id,username,followers_count,follows_count,media_count", tok);
  return me as { id: string; username: string; followers_count: number; follows_count: number; media_count: number };
}

export function isConnected() {
  return !!token();
}

/** Pull the profile, every post, and per-post insights for recent posts. */
export async function syncInstagram(): Promise<{ ok: boolean; message: string }> {
  const d = db();
  const log = (ok: boolean, message: string) => {
    d.prepare("INSERT INTO sync_runs (at, ok, message) VALUES (?, ?, ?)").run(new Date().toISOString(), ok ? 1 : 0, message);
    return { ok, message };
  };
  const tok = token();
  if (!tok) return log(false, "Instagram is not connected yet.");
  try {
    const me = await checkToken(tok);
    if (me.username !== EXPECTED_USERNAME) return log(false, `Wrong account (@${me.username}). Connect @${EXPECTED_USERNAME}.`);
    d.prepare(
      "INSERT INTO account_snapshots (day, followers, follows, media_count) VALUES (?, ?, ?, ?) ON CONFLICT(day) DO UPDATE SET followers=excluded.followers, follows=excluded.follows, media_count=excluded.media_count",
    ).run(dubaiDay(), me.followers_count, me.follows_count, me.media_count);

    let url = "/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=50";
    let count = 0;
    const upsert = d.prepare(`INSERT INTO posts (id, caption, media_type, permalink, thumb, posted_at, likes, comments, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET caption=excluded.caption, permalink=excluded.permalink,
        thumb=COALESCE(excluded.thumb, posts.thumb), likes=excluded.likes, comments=excluded.comments, synced_at=excluded.synced_at`);
    const ids: string[] = [];
    for (let page = 0; page < 10 && url; page++) {
      const j = await get(url, tok);
      for (const m of j.data as Array<Record<string, string | number>>) {
        const thumb = (m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url) as string | undefined;
        upsert.run(String(m.id), (m.caption as string) ?? null, String(m.media_type), (m.permalink as string) ?? null, thumb ?? null,
          String(m.timestamp), Number(m.like_count || 0), Number(m.comments_count || 0), new Date().toISOString());
        ids.push(String(m.id));
        count++;
      }
      const next: string | undefined = j.paging?.next;
      url = next ? next.replace(GRAPH, "").replace(/&access_token=[^&]+/, "") : "";
    }

    // Insights for the newest 40 posts (older numbers barely move).
    const setIns = d.prepare("UPDATE posts SET reach=?, views=?, saves=?, shares=?, interactions=? WHERE id=?");
    let ins = 0;
    for (const id of ids.slice(0, 40)) {
      try {
        const j = await get(`/${id}/insights?metric=reach,views,saved,shares,total_interactions`, tok);
        const v = (n: string) => Number(j.data.find((x: { name: string }) => x.name === n)?.values?.[0]?.value || 0);
        setIns.run(v("reach"), v("views"), v("saved"), v("shares"), v("total_interactions"), id);
        ins++;
      } catch { /* some old posts have no insights — skip */ }
    }
    return log(true, `Synced ${count} posts, insights for ${ins}.`);
  } catch (e) {
    return log(false, e instanceof Error ? e.message : "Sync failed");
  }
}
