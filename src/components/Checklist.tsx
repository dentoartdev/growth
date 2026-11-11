"use client";
import { useOptimistic, useTransition } from "react";
import { toggleTask } from "@/app/actions";

export type CheckItem = { key: string; label: string; sub?: string; done: boolean };

export default function Checklist({ day, items }: { day: string; items: CheckItem[] }) {
  const [, start] = useTransition();
  const [list, setList] = useOptimistic(items, (s, k: string) => s.map((i) => (i.key === k ? { ...i, done: !i.done } : i)));
  return (
    <div>
      {list.map((i) => (
        <button key={i.key} type="button" className={`check${i.done ? " done" : ""}`}
          onClick={() => start(async () => { setList(i.key); await toggleTask(day, i.key, !i.done); })}>
          <span className="box">{i.done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2"><path d="M5 12.5 10 17 19 7" /></svg>}</span>
          <span><div className="lbl">{i.label}</div>{i.sub && <div className="sm">{i.sub}</div>}</span>
        </button>
      ))}
    </div>
  );
}
