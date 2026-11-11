"use client";
import { useState } from "react";

export type AdInput = {
  id?: number; name: string; goal: string; start_day: string; end_day: string; daily_budget: number; spend: number;
  reach: number; clicks: number; messages: number; new_clients: number; status: string; notes: string;
};
export type Ad = AdInput & { id: number };

const EMPTY: AdInput = { name: "", goal: "Messages", start_day: "", end_day: "", daily_budget: 50, spend: 0, reach: 0, clicks: 0, messages: 0, new_clients: 0, status: "planned", notes: "" };
const GOALS = ["Messages", "Profile visits", "Followers", "Website visits"];
const STATUSES = ["planned", "running", "paused", "finished"];

function verdict(a: Ad): { t: string; c: string } {
  if (a.status === "planned") return { t: "Not started", c: "" };
  if (!a.spend) return { t: "No data yet", c: "" };
  if (!a.messages) return a.spend > 150 ? { t: "Stop it", c: "red" } : { t: "Too early", c: "" };
  const cpm = a.spend / a.messages;
  return cpm < 15 ? { t: "Good", c: "grn" } : cpm <= 35 ? { t: "OK", c: "gold" } : { t: "Stop it", c: "red" };
}

export default function AdsManager({ ads, onSave, onDelete }: { ads: Ad[]; onSave: (a: Ad) => void; onDelete: (id: number) => void }) {
  const [form, setForm] = useState<AdInput | null>(null);
  const set = (k: keyof AdInput, v: string) =>
    setForm((f) => f && { ...f, [k]: ["daily_budget", "spend", "reach", "clicks", "messages", "new_clients"].includes(k) ? Number(v) || 0 : v });

  return (
    <section className="card">
      <div className="hd"><h2>Your ads</h2>
        {!form && <button className="btn gold sm" style={{ marginLeft: "auto" }} onClick={() => setForm({ ...EMPTY })}>+ Add an ad</button>}
      </div>
      <div className="bd">
        {form && (
          <div style={{ background: "#F7F8FA", border: "1px solid var(--line2)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div className="form">
              <label className="span2">Ad name<input className="in" value={form.name} placeholder="e.g. Boost — 8 veneers Reel" onChange={(e) => set("name", e.target.value)} /></label>
              <label>Goal<select className="in" value={form.goal} onChange={(e) => set("goal", e.target.value)}>{GOALS.map((g) => <option key={g}>{g}</option>)}</select></label>
              <label>Status<select className="in" value={form.status} onChange={(e) => set("status", e.target.value)}>{STATUSES.map((g) => <option key={g} value={g}>{g[0].toUpperCase() + g.slice(1)}</option>)}</select></label>
              <label>Start<input className="in" type="date" value={form.start_day} onChange={(e) => set("start_day", e.target.value)} /></label>
              <label>End<input className="in" type="date" value={form.end_day} onChange={(e) => set("end_day", e.target.value)} /></label>
              <label>Budget / day (AED)<input className="in" type="number" inputMode="decimal" value={form.daily_budget} onChange={(e) => set("daily_budget", e.target.value)} /></label>
              <label>Spent so far (AED)<input className="in" type="number" inputMode="decimal" value={form.spend} onChange={(e) => set("spend", e.target.value)} /></label>
              <label>Reach<input className="in" type="number" inputMode="numeric" value={form.reach} onChange={(e) => set("reach", e.target.value)} /></label>
              <label>Clicks<input className="in" type="number" inputMode="numeric" value={form.clicks} onChange={(e) => set("clicks", e.target.value)} /></label>
              <label>Messages<input className="in" type="number" inputMode="numeric" value={form.messages} onChange={(e) => set("messages", e.target.value)} /></label>
              <label>New clients<input className="in" type="number" inputMode="numeric" value={form.new_clients} onChange={(e) => set("new_clients", e.target.value)} /></label>
              <label className="span4">Notes<textarea className="in" value={form.notes} placeholder="Audience, which post, what you changed…" onChange={(e) => set("notes", e.target.value)} /></label>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn gold" onClick={() => { onSave({ ...form, name: form.name.trim() || "Untitled ad", id: form.id ?? Date.now() }); setForm(null); }}>Save</button>
              <button className="btn" onClick={() => setForm(null)}>Cancel</button>
              {form.id && <button className="btn" style={{ marginLeft: "auto", color: "var(--red)" }} onClick={() => { if (confirm("Delete this ad?")) { onDelete(form.id!); setForm(null); } }}>Delete</button>}
            </div>
          </div>
        )}
        {ads.length === 0 && !form ? (
          <div className="empty">No ads yet. Press “Add an ad” when you start your first one.</div>
        ) : ads.length > 0 && (
          <div className="tablewrap">
            <table className="t">
              <thead><tr><th>Ad</th><th>Status</th><th>Spent</th><th>Messages</th><th>Per message</th><th>Clients</th><th>Verdict</th><th /></tr></thead>
              <tbody>
                {ads.map((a) => {
                  const v = verdict(a);
                  return (
                    <tr key={a.id}>
                      <td><b>{a.name}</b><div className="faint" style={{ fontSize: 12 }}>{a.goal}{a.start_day ? ` · from ${a.start_day}` : ""}</div></td>
                      <td><span className={`tag ${a.status === "running" ? "grn" : ""}`}>{a.status}</span></td>
                      <td>{Math.round(a.spend)} AED</td>
                      <td>{a.messages}</td>
                      <td>{a.messages ? `${Math.round(a.spend / a.messages)} AED` : "—"}</td>
                      <td>{a.new_clients}</td>
                      <td><span className={`tag ${v.c}`}>{v.t}</span></td>
                      <td><button className="btn sm" onClick={() => setForm({ ...a, start_day: a.start_day || "", end_day: a.end_day || "", notes: a.notes || "" })}>Update</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
