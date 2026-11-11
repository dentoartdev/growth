"use client";
import { useMemo, useState } from "react";
import { useData } from "@/lib/data";
import { overview, scoredPosts } from "@/lib/analysis";
import { fmt } from "@/lib/dates";
import PostCard from "@/components/PostCard";
import Loading from "@/components/Loading";

const FILTERS = ["All", "Reel", "Carousel", "Photo", "Top"];

export default function Posts() {
  const data = useData();
  const [f, setF] = useState("All");
  const [n, setN] = useState(24);
  const o = useMemo(() => (data ? overview(data.posts, data.account, data.live) : null), [data]);
  const all = useMemo(() => (data ? scoredPosts(data.posts) : []), [data]);
  if (!data || !o) return <Loading title="What’s working" />;

  let posts = all;
  if (f === "Top") posts = [...all].sort((a, b) => b.reach - a.reach);
  else if (f !== "All") posts = all.filter((p) => p.format === f);
  const maxTopic = o.byTopic[0]?.avgReach || 1;

  return (
    <>
      <header className="band">
        <div className="eyebrow">Posts</div>
        <h1>What’s working</h1>
        <div className="sub">{o.total} posts analysed · reach compared with the account’s recent average</div>
      </header>
      <div className="content">
        <div className="grid3">
          <section className="card"><div className="hd"><h2>By format</h2></div>
            <div className="bd bars">{o.byFormat.map((g) => (
              <div key={g.key} className="bar"><div className="top"><b>{g.key}</b><span className="muted">{fmt(g.avgReach)} reach · {fmt(g.avgSaves)} saves</span></div>
                <div className="track"><div className="fill" style={{ width: `${(g.avgReach / o.byFormat[0].avgReach) * 100}%` }} /></div></div>
            ))}</div>
          </section>
          <section className="card"><div className="hd"><h2>By type of content</h2></div>
            <div className="bd bars">{o.byTopic.map((g) => (
              <div key={g.key} className="bar"><div className="top"><b>{g.key}</b><span className="muted">{fmt(g.avgReach)} · {g.posts} posts</span></div>
                <div className="track"><div className="fill" style={{ width: `${(g.avgReach / maxTopic) * 100}%`, background: "var(--slate)" }} /></div></div>
            ))}</div>
          </section>
          <section className="card"><div className="hd"><h2>In one line</h2></div>
            <div className="bd">
              <div className="tip do"><span className="dot" /><div><b>Do more: {o.byTopic[0]?.key}</b><p>Highest reach per post of any type of content.</p></div></div>
              <div className="tip do"><span className="dot" /><div><b>Best format: {o.byFormat[0]?.key}</b><p>{fmt(o.byFormat[0]?.avgReach || 0)} average reach.</p></div></div>
              <div className="tip urgent"><span className="dot" /><div><b>Do less: {o.byFormat[o.byFormat.length - 1]?.key}</b><p>Lowest reach — use it rarely.</p></div></div>
            </div>
          </section>
        </div>

        <div className="filters">
          {FILTERS.map((x) => <a key={x} href="#" className={f === x ? "on" : ""} onClick={(e) => { e.preventDefault(); setF(x); setN(24); }}>{x === "Top" ? "Best ever" : x}</a>)}
        </div>
        <div className="posts">{posts.slice(0, n).map((p) => <PostCard key={p.id} p={p} />)}</div>
        {posts.length > n && <div style={{ textAlign: "center" }}><button className="btn" onClick={() => setN(n + 24)}>Show more</button></div>}
      </div>
    </>
  );
}
