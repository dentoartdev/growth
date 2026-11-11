"use server";
import { revalidatePath } from "next/cache";
import { db, setSetting } from "@/lib/db";
import { checkToken, syncInstagram, EXPECTED_USERNAME } from "@/lib/instagram";

export async function toggleTask(day: string, task: string, done: boolean) {
  if (done) db().prepare("INSERT OR IGNORE INTO task_checks (day, task) VALUES (?, ?)").run(day, task);
  else db().prepare("DELETE FROM task_checks WHERE day = ? AND task = ?").run(day, task);
  revalidatePath("/");
}

export async function setPlanStatus(id: number, status: string) {
  if (!["idea", "ready", "posted", "skipped"].includes(status)) return;
  db().prepare("UPDATE plan_items SET status = ? WHERE id = ?").run(status, id);
  revalidatePath("/plan");
  revalidatePath("/");
}

export async function updatePlanItem(id: number, f: { title: string; hook: string; caption: string; cta: string; notes: string }) {
  db().prepare("UPDATE plan_items SET title=?, hook=?, caption=?, cta=?, notes=? WHERE id=?").run(f.title, f.hook, f.caption, f.cta, f.notes, id);
  revalidatePath("/plan");
  revalidatePath("/");
}

export type AdInput = {
  id?: number; name: string; goal: string; start_day: string; end_day: string; daily_budget: number; spend: number;
  reach: number; clicks: number; messages: number; new_clients: number; status: string; notes: string;
};

export async function saveAd(a: AdInput) {
  const vals = [a.name.trim() || "Untitled ad", a.goal, a.start_day || null, a.end_day || null, a.daily_budget || 0, a.spend || 0,
    a.reach || 0, a.clicks || 0, a.messages || 0, a.new_clients || 0, a.status, a.notes || null];
  if (a.id) db().prepare("UPDATE ads SET name=?, goal=?, start_day=?, end_day=?, daily_budget=?, spend=?, reach=?, clicks=?, messages=?, new_clients=?, status=?, notes=? WHERE id=?").run(...vals, a.id);
  else db().prepare("INSERT INTO ads (name, goal, start_day, end_day, daily_budget, spend, reach, clicks, messages, new_clients, status, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").run(...vals);
  revalidatePath("/ads");
}

export async function deleteAd(id: number) {
  db().prepare("DELETE FROM ads WHERE id = ?").run(id);
  revalidatePath("/ads");
}

/** Save an Instagram token after checking it belongs to the right account. The token is never sent back. */
export async function connectInstagram(token: string): Promise<{ ok: boolean; message: string }> {
  const t = token.trim();
  if (t.length < 40) return { ok: false, message: "That does not look like a full token." };
  try {
    const me = await checkToken(t);
    if (me.username !== EXPECTED_USERNAME) return { ok: false, message: `This token is for @${me.username}, not @${EXPECTED_USERNAME}.` };
    setSetting("ig_token", t);
    setSetting("ig_connected_at", new Date().toISOString());
    const r = await syncInstagram();
    revalidatePath("/", "layout");
    return { ok: true, message: `Connected @${me.username}. ${r.message}` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Could not check the token." };
  }
}

export async function disconnectInstagram() {
  setSetting("ig_token", null);
  revalidatePath("/", "layout");
}

export async function runSync() {
  const r = await syncInstagram();
  revalidatePath("/", "layout");
  return r;
}
