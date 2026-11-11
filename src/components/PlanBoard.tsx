"use client";
import { useState } from "react";
import type { PlanItem as Item } from "@/lib/plan";

type Day = { day: string; label: string; isToday: boolean };
type Patch = Partial<Pick<Item, "status" | "title" | "hook" | "caption" | "cta" | "notes">>;

const STATUS = [
  { k: "idea", l: "Idea" }, { k: "ready", l: "Ready" }, { k: "posted", l: "Posted" }, { k: "skipped", l: "Skipped" },
];

export default function PlanBoard({ days, items, onChange }: { days: Day[]; items: Item[]; onChange: (id: string, p: Patch) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
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
      {open && <Detail key={open.id} item={open} onChange={(p) => onChange(open.id, p)} when={days.find((d) => d.day === open.day)?.label || open.day} onClose={() => setOpenId(null)} />}
    </div>
  );
}

function Detail({ item, when, onClose, onChange }: { item: Item; when: string; onClose: () => void; onChange: (p: Patch) => void }) {
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
              <button className="btn gold" onClick={() => { onChange(f); setEdit(false); }}>Save</button>
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
              <a key={s.k} href="#" className={item.status === s.k ? "on" : ""} onClick={(e) => { e.preventDefault(); onChange({ status: s.k }); }}>{s.l}</a>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
