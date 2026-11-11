import type { ScoredPost } from "@/lib/analysis";
import { fmt, prettyDate } from "@/lib/dates";

const VCLASS: Record<string, string> = { Top: "gold", Good: "grn", Average: "", Weak: "red" };

export default function PostCard({ p }: { p: ScoredPost }) {
  const body = (
    <>
      <div className="img" style={p.thumb ? { backgroundImage: `url(${p.thumb})` } : undefined}>
        {!p.thumb && <span>{p.format}</span>}
        <span className="fmt">{p.format}</span>
        <span className={`tag vd ${VCLASS[p.verdict]}`}>{p.verdict}</span>
      </div>
      <div className="info">
        <div className="faint" style={{ fontSize: 12 }}>{prettyDate(p.posted_at)} · {p.topic}</div>
        <div className="cap">{p.caption || "No caption"}</div>
        <div className="stats">
          <span><b>{fmt(p.reach)}</b> reach</span>
          <span><b>{fmt(p.saves)}</b> saves</span>
          <span><b>{fmt(p.likes)}</b> likes</span>
        </div>
      </div>
    </>
  );
  return p.permalink
    ? <a className="card post" href={p.permalink} target="_blank" rel="noreferrer">{body}</a>
    : <div className="card post">{body}</div>;
}
