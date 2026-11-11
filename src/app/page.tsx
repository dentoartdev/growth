"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useData } from "@/lib/data";
import { useStored } from "@/lib/store";
import { overview, TARGET_POSTS_PER_WEEK } from "@/lib/analysis";
import { weekPlan, DAILY_HABITS, type PlanEdits } from "@/lib/plan";
import { fmt, prettyDay, prettyDate, addDays, weekStart, dubaiDay } from "@/lib/dates";
import Checklist, { type CheckItem } from "@/components/Checklist";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";
import { SettingsIcon } from "@/components/Nav";

export default function Today() {
  const data = useData();
  const today = dubaiDay();
  const [checks, setChecks] = useStored<Record<string, string[]>>("checks", {});
  const [edits] = useStored<PlanEdits>("plan", {});
  const o = useMemo(() => (data ? overview(data.posts, data.account, data.live, today) : null), [data, today]);
  if (!data || !o) return <Loading title="Today" />;

  const ws = weekStart(today);
  const week = [...weekPlan(ws, edits), ...weekPlan(addDays(ws, 7), edits)];
  const todays = week.filter((i) => i.day === today && i.status !== "skipped");
  const upcoming = week.filter((i) => i.day > today && i.day <= addDays(today, 7) && i.status !== "posted").slice(0, 3);
  const done = new Set(checks[today] || []);

  const items: CheckItem[] = [
    ...todays.map((t) => ({ key: `post-${t.id}`, label: `Post a ${t.format}: ${t.title}`, sub: `${t.pillar} · best time ${t.best_time} · hook: “${t.hook}”`, done: done.has(`post-${t.id}`) || t.status === "posted" })),
    ...DAILY_HABITS.map((h) => ({ key: h.key, label: h.label, done: done.has(h.key) })),
  ];
  const toggle = (key: string, on: boolean) =>
    setChecks((c) => {
      const s = new Set(c[today] || []);
      if (on) s.add(key); else s.delete(key);
      // keep only the last 30 days
      const keep = Object.fromEntries(Object.entries(c).filter(([d]) => d >= addDays(today, -30)));
      return { ...keep, [today]: [...s] };
    });
  const doneCount = items.filter((i) => i.done).length;
  const reachDelta = o.olderReach ? Math.round(((o.recentReach - o.olderReach) / o.olderReach) * 100) : 0;
  const postedThisWeek = weekPlan(ws, edits).filter((i) => i.status === "posted").length;
  const weekProgress = Math.max(postedThisWeek, data.live ? o.postsThisWeek : 0);

  return (
    <>
      <header className="band">
        <div className="row">
          <div className="grow">
            <div className="eyebrow">{prettyDay(today)}</div>
            <h1>Today</h1>
            <div className="sub">{doneCount} of {items.length} tasks done{todays.length ? " · a post is planned today" : " · no post planned today — focus on Stories"}</div>
          </div>
          <Link href="/settings" className="pill" title="Settings">
            <span className={`livedot${data.live ? "" : " off"}`} />
            {data.live ? `Updated ${prettyDate(data.generatedAt)}` : "Not connected"}
            <span style={{ width: 16, height: 16, marginLeft: 8, display: "inline-flex" }}><SettingsIcon /></span>
          </Link>
        </div>
        <div className="kpis">
          <div className="kpi"><div className="l">Followers</div><div className="v">{o.snap ? fmt(o.snap.followers) : "—"}</div><div className="d">as of {o.snap ? prettyDay(o.snap.day) : "—"}</div></div>
          <div className="kpi"><div className="l">This week</div><div className="v">{weekProgress}<span style={{ fontSize: 16, color: "var(--dkmut)" }}> / {TARGET_POSTS_PER_WEEK}</span></div><div className="d">posts published</div></div>
          <div className="kpi"><div className="l">Reach per post</div><div className="v">{fmt(o.recentReach)}</div><div className={`d ${reachDelta >= 0 ? "up" : "down"}`}>{reachDelta >= 0 ? "▲" : "▼"} {Math.abs(reachDelta)}% vs earlier posts</div></div>
          <div className="kpi"><div className="l">Last post</div><div className="v">{o.daysSinceLast ?? "—"}<span style={{ fontSize: 16, color: "var(--dkmut)" }}> days</span></div><div className={`d ${o.daysSinceLast !== null && o.daysSinceLast > 4 ? "down" : ""}`}>{o.last ? prettyDate(o.last.posted_at) : "no posts yet"}</div></div>
        </div>
      </header>

      <div className="content">
        {!data.live && (
          <div className="note warn">Instagram is not connected yet, so these numbers stop at {o.last ? prettyDate(o.last.posted_at) : "—"}. <Link href="/settings" style={{ textDecoration: "underline", fontWeight: 600 }}>See how to connect</Link>.</div>
        )}
        <div className="grid2">
          <section className="card">
            <div className="hd"><h2>To do today</h2><span className="meta">{doneCount}/{items.length}</span></div>
            <div className="bd"><Checklist items={items} onToggle={toggle} /></div>
          </section>
          <section className="card">
            <div className="hd"><h2>Coach says</h2></div>
            <div className="bd">
              {o.tips.slice(0, 4).map((t, i) => (
                <div key={i} className={`tip ${t.level}`}><span className="dot" /><div><b>{t.title}</b><p>{t.why}</p></div></div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid2">
          <section className="card">
            <div className="hd"><h2>Coming up</h2><Link href="/plan" className="meta" style={{ color: "var(--gold2)", fontWeight: 600 }}>Full plan →</Link></div>
            <div className="bd">
              {upcoming.length === 0 && <div className="empty">Nothing planned in the next 7 days.</div>}
              {upcoming.map((u) => (
                <div key={u.id} className="tip"><span className="dot" style={{ background: "var(--gold)" }} />
                  <div><b>{prettyDay(u.day)} · {u.format}</b><p>{u.title}</p></div></div>
              ))}
            </div>
          </section>
          <section className="card">
            <div className="hd"><h2>What works best</h2><Link href="/posts" className="meta" style={{ color: "var(--gold2)", fontWeight: 600 }}>All posts →</Link></div>
            <div className="bd bars">
              {o.byFormat.map((g) => (
                <div key={g.key} className="bar">
                  <div className="top"><b>{g.key}</b><span className="muted">{fmt(g.avgReach)} avg reach</span></div>
                  <div className="track"><div className="fill" style={{ width: `${Math.round((g.avgReach / o.byFormat[0].avgReach) * 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section>
          <div className="sec" style={{ marginBottom: 10 }}>Best of the last 30 posts</div>
          <div className="posts">{o.bestRecent.map((p) => <PostCard key={p.id} p={p} />)}</div>
        </section>
      </div>
    </>
  );
}
