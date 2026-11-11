export default function Loading({ title }: { title: string }) {
  return (
    <>
      <header className="band"><div className="eyebrow">Growth</div><h1>{title}</h1><div className="sub">Loading…</div></header>
      <div className="content"><div className="card"><div className="empty">Loading the latest numbers…</div></div></div>
    </>
  );
}
