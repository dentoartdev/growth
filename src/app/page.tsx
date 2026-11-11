import Link from "next/link";
import { overview, lastSync, TARGET_POSTS_PER_WEEK } from "@/lib/analysis";
import { ensurePlan, planBetween, DAILY_HABITS } from "@/lib/plan";
import { db } from "@/lib/db";
import { isConnected } from "@/lib/instagram";
import { fmt, prettyDay, prettyDate, addDays, weekStart } from "@/lib/dates";
import Checklist, { type CheckItem } from "@/components/Checklist";
import PostCard from "@/components/PostCard";
import { SettingsIcon } from "@/components/Nav";

export const dynamic = "force-dynamic";

export default function Today() {
  const connected = isConnected();
  const o = overview(connected);
  ensurePlan(o.today);
  const todays = planBetween(o.today, o.today);
  const ws = weekStart(o.today);
  const week = planBetween(ws, addDays(ws, 6));
  const upcoming = planBetween(addDays(o.today, 1), addDays(o.today, 7)).filter((i) => i.status !== "posted").slice(0, 3);
  const doneSet = new Set((db().prepare("SELECT task FROM task_checks WHERE day = ?").all(o.today) as { task: string }[]).map((r) => r.task));
  const sync = lastSync();

  const items: CheckItem[] = [
    ...todays.map((t) => ({ key: `post-${t.id}`, label: `Post a ${t.format}: ${t.title}`, sub: `${t.pillar} · best time ${t.best_time} · hook: “${t.hook}”`, done: doneSet.has(`post-${t.id}`) || t.status === "posted" })),
    ...DAILY_HABITS.map((h) => ({ key: h.key, label: h.label, done: doneSet.has(h.key) })),
  ];
  const doneCount = items.filter((i) => i.done).length;

  const reachDelta = o.olderReach ? Math.round(((o.recentReach - o.olderReach) / o.olderReach) * 100) : 0;
  const postedThisWeek = week.filter((i) => i.status === "posted").length;
  const weekProgress = Math.max(postedThisWeek, o.postsThisWeek);

  return (
    <>
      <header className="band">
        <div className="row">
          <div className="grow">
            <div className="eyebrow">{prettyDay(o.today)}</div>
            <h1>Today</h1>
            <div className="sub">{doneCount} of {items.length} tasks done{todays.length ? " · a post is planned today" : " · no post planned today — focus on Stories"}</div>
          </div>
          <Link href="/settings" className="pill" title="Settings">
            <span className={`livedot${connected ? "" : " off"}`} />
            {connected ? (sync ? `Synced ${prettyDate(sync.at)}` : "Connected") : "Connect Instagram"}
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
        {!connected && (
          <div className="note warn">Instagram is not connected, so these numbers are from the last import ({o.last ? "posts up to " + prettyDate(o.last.posted_at) : "none"}). <Link href="/settings" style={{ textDecoration: "underline", fontWeight: 600 }}>Connect it in Settings</Link> to get live numbers.</div>
        )}
        <div className="grid2">
          <section className="card">
            <div className="hd"><h2>To do today</h2><span className="meta">{doneCount}/{items.length}</span></div>
            <div className="bd"><Checklist day={o.today} items={items} /></div>
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
