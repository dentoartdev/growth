import Link from "next/link";
import { ensurePlan, planBetween, WEEK_RHYTHM } from "@/lib/plan";
import { dubaiDay, weekStart, addDays, prettyDay, parseDay } from "@/lib/dates";
import PlanBoard from "@/components/PlanBoard";

export const dynamic = "force-dynamic";

export default async function Plan({ searchParams }: { searchParams: Promise<{ w?: string }> }) {
  const sp = await searchParams;
  const today = dubaiDay();
  ensurePlan(today, 4);
  const shift = Math.max(-8, Math.min(3, Number(sp.w) || 0));
  const ws = addDays(weekStart(today), shift * 7);
  const we = addDays(ws, 6);
  const items = planBetween(ws, we);
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
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
            <Link className="btn sm" href={`/plan?w=${shift - 1}`}>← Prev</Link>
            {shift !== 0 && <Link className="btn sm" href="/plan">Today</Link>}
            <Link className="btn sm" href={`/plan?w=${shift + 1}`}>Next →</Link>
          </div>
        </div>
      </header>
      <div className="content">
        <PlanBoard days={days.map((d) => ({ day: d, label: prettyDay(d), isToday: d === today, dow: parseDay(d).getUTCDay() }))} items={items} />
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

const WHY: Record<string, string> = {
  Transformation: "Before/after is the biggest reach the account ever had (331K on one Reel).",
  Education: "Carousels get saved — saves tell Instagram to show the post to more people.",
  "Inside the lab": "Process videos build trust with doctors and show the craft.",
  Question: "Questions make people comment. Comments push the post to new people.",
};
