"use client";
import { useState, useTransition } from "react";
import { setPlanStatus, updatePlanItem } from "@/app/actions";

type Item = {
  id: number; day: string; format: string; pillar: string; title: string; hook: string | null; caption: string | null;
  cta: string | null; best_time: string | null; status: string; notes: string | null;
};
type Day = { day: string; label: string; isToday: boolean; dow: number };

const STATUS = [
  { k: "idea", l: "Idea" }, { k: "ready", l: "Ready" }, { k: "posted", l: "Posted" }, { k: "skipped", l: "Skipped" },
];

export default function PlanBoard({ days, items }: { days: Day[]; items: Item[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const open = items.find((i) => i.id === openId) || null;
  return (
    <div className={open ? "grid2 planopen" : ""}>
      <div className="week">
        {days.map((d) => {
          const its = items.filter((i) => i.day === d.day);
          return (
            <div key={d.day} className={`day${d.isToday ? " today" : ""}`}>
              <div className="dh"><b>{d.label.split(" ")[0]}</b><span>{d.label.split(" ").slice(1).join(" ")}{d.isToday ? " · today" : ""}</span></div>
              <div className="db">
                {its.map((i) => (
                  <button key={i.id} type="button" className={`slot${i.status === "posted" ? " posted" : ""}`} onClick={() => setOpenId(i.id === openId ? null : i.id)}
                    style={i.status === "skipped" ? { opacity: .5 } : i.id === openId ? { boxShadow: "0 0 0 2px var(--gold)" } : undefined}>
                    <div className="f">{i.format} · {i.status === "posted" ? "posted" : i.status === "ready" ? "ready" : i.best_time}</div>
                    <div className="ttl">{i.title}</div>
                  </button>
                ))}
                <div className="story">+ Stories (3–5)</div>
              </div>
            </div>
          );
        })}
      </div>
      {open && <Detail key={open.id} item={open} when={days.find((d) => d.day === open.day)?.label || open.day} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function Detail({ item, when, onClose }: { item: Item; when: string; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ title: item.title, hook: item.hook || "", caption: item.caption || "", cta: item.cta || "", notes: item.notes || "" });
  const [copied, setCopied] = useState(false);
  const fullCaption = `${f.hook}\n\n${f.caption}\n\n${f.cta}`;
  return (
    <>
    <div className="sheetscrim" onClick={onClose} />
    <section className="card detailcard" style={{ position: "sticky", top: 16 }}>
      <div className="hd">
        <span className="tag gold">{item.format}</span><span className="tag">{item.pillar}</span>
        <button className="btn sm" style={{ marginLeft: "auto" }} onClick={onClose}>Close</button>
      </div>
      <div className="bd detail">
        {edit ? (
          <>
            {(["title", "hook", "caption", "cta", "notes"] as const).map((k) => (
              <label key={k} className="field"><div className="k">{k === "cta" ? "Call to action" : k}</div>
                {k === "caption" || k === "notes"
                  ? <textarea className="in" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
                  : <input className="in" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}
              </label>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn gold" disabled={pending} onClick={() => start(async () => { await updatePlanItem(item.id, f); setEdit(false); })}>Save</button>
              <button className="btn" onClick={() => setEdit(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div className="field"><div className="k">Post</div><div className="v" style={{ fontWeight: 650, fontSize: 16 }}>{f.title}</div></div>
            <div className="field"><div className="k">When</div><div className="v">{when} · {item.best_time} (Dubai time)</div></div>
            <div className="field"><div className="k">Caption — ready to copy</div><div className="copy">{fullCaption}</div></div>
            {f.notes && <div className="field"><div className="k">Notes</div><div className="v muted">{f.notes}</div></div>}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn dark" onClick={() => { navigator.clipboard.writeText(fullCaption); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "Copied ✓" : "Copy caption"}</button>
              <button className="btn" onClick={() => setEdit(true)}>Edit</button>
            </div>
          </>
        )}
        <div className="field"><div className="k">Status</div>
          <div className="filters">
            {STATUS.map((s) => (
              <a key={s.k} href="#" className={item.status === s.k ? "on" : ""} onClick={(e) => { e.preventDefault(); start(() => setPlanStatus(item.id, s.k)); }}>{s.l}</a>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
