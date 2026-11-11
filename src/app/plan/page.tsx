"use client";
import { useState } from "react";
import { useStored } from "@/lib/store";
import { weekPlan, WEEK_RHYTHM, type PlanEdits } from "@/lib/plan";
import { dubaiDay, weekStart, addDays, prettyDay } from "@/lib/dates";
import PlanBoard from "@/components/PlanBoard";

const WHY: Record<string, string> = {
  Transformation: "Before/after is the biggest reach the account ever had (331K on one Reel).",
  Education: "Carousels get saved — saves tell Instagram to show the post to more people.",
  "Inside the lab": "Process videos build trust with doctors and show the craft.",
  Question: "Questions make people comment. Comments push the post to new people.",
};

export default function Plan() {
  const today = dubaiDay();
  const [shift, setShift] = useState(0);
  const [edits, setEdits] = useStored<PlanEdits>("plan", {});
  const ws = addDays(weekStart(today), shift * 7);
  const we = addDays(ws, 6);
  const items = weekPlan(ws, edits);
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i)).map((d) => ({ day: d, label: prettyDay(d), isToday: d === today }));
  const posted = items.filter((i) => i.status === "posted").length;
  const label = shift === 0 ? "This week" : shift === 1 ? "Next week" : shift === -1 ? "Last week" : `Week of ${prettyDay(ws)}`;

  return (
    <>
      <header className="band">
        <div className="row">
          <div className="grow">
            <div className="eyebrow">Content plan</div>
            <h1>{label}</h1>
            <div className="sub">{prettyDay(ws)} – {prettyDay(we)} · {posted} of {items.length} posted · Stories every day</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn sm" onClick={() => setShift(shift - 1)}>← Prev</button>
            {shift !== 0 && <button className="btn sm" onClick={() => setShift(0)}>Today</button>}
            <button className="btn sm" onClick={() => setShift(shift + 1)}>Next →</button>
          </div>
        </div>
      </header>
      <div className="content">
        <PlanBoard days={days} items={items} onChange={(id, patch) => setEdits((e) => ({ ...e, [id]: { ...e[id], ...patch } }))} />
        <section className="card">
          <div className="hd"><h2>The weekly rhythm</h2><span className="meta">4 posts + daily Stories</span></div>
          <div className="bd">
            <div className="tablewrap"><table className="t">
              <thead><tr><th>Day</th><th>Format</th><th>Type</th><th>Best time</th><th>Why</th></tr></thead>
              <tbody>
                {WEEK_RHYTHM.map((r) => (
                  <tr key={r.slot}><td><b>{r.slot}</b></td><td>{r.format}</td><td>{r.pillar}</td><td>{r.best_time}</td>
                    <td className="wrap muted">{WHY[r.pillar]}</td></tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </section>
      </div>
    </>
  );
}
