"use client";

export type CheckItem = { key: string; label: string; sub?: string; done: boolean };

export default function Checklist({ items, onToggle }: { items: CheckItem[]; onToggle: (key: string, done: boolean) => void }) {
  return (
    <div>
      {items.map((i) => (
        <button key={i.key} type="button" className={`check${i.done ? " done" : ""}`} onClick={() => onToggle(i.key, !i.done)}>
          <span className="box">{i.done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"><path d="M5 12.5 10 17 19 7" /></svg>}</span>
          <span><div className="lbl">{i.label}</div>{i.sub && <div className="sm">{i.sub}</div>}</span>
        </button>
      ))}
    </div>
  );
}
