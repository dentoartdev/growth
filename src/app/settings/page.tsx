"use client";
import { useState } from "react";
import { useData } from "@/lib/data";
import { exportAll, importAll } from "@/lib/store";
import { prettyDate } from "@/lib/dates";

const REPO = "https://github.com/dentoartdev/growth";

export default function Settings() {
  const data = useData();
  const [backup, setBackup] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <>
      <header className="band">
        <div className="eyebrow">Settings</div>
        <h1>Connection & data</h1>
        <div className="sub">
          <span className={`livedot${data?.live ? "" : " off"}`} />
          {!data ? "Loading…" : data.live ? `Connected to @dentoart.dubai · updated ${prettyDate(data.generatedAt)}` : "Instagram not connected — showing older numbers"}
        </div>
      </header>
      <div className="content">
        {data?.error && <div className="note warn">{data.error}</div>}
        <div className="grid2">
          <section className="card">
            <div className="hd"><h2>Connect Instagram (once, 5 min)</h2></div>
            <div className="bd">
              <ol className="steps">
                <li><div><b>Get a token from Meta</b><span>developers.facebook.com → My Apps → “For photos Galary” → Instagram → API setup with Instagram login → Generate token next to @dentoart.dubai. Copy it.</span></div></li>
                <li><div><b>Save it in GitHub (never here)</b><span>Open the <a href={`${REPO}/settings/secrets/actions/new`} target="_blank" rel="noreferrer" style={{ color: "var(--gold2)", fontWeight: 600 }}>new secret page</a>. Name: <code>INSTAGRAM_ACCESS_TOKEN</code>. Paste the token. Save.</span></div></li>
                <li><div><b>Run the update</b><span>Open <a href={`${REPO}/actions/workflows/update.yml`} target="_blank" rel="noreferrer" style={{ color: "var(--gold2)", fontWeight: 600 }}>Actions → Update & publish</a> → “Run workflow”. In about 2 minutes this app shows live numbers.</span></div></li>
              </ol>
              <div className="note" style={{ marginTop: 14 }}>After that it updates by itself every morning at 7:00 (Dubai). You can press “Run workflow” any time to update now.</div>
            </div>
          </section>
          <section className="card">
            <div className="hd"><h2>Add to your phone</h2></div>
            <div className="bd">
              <ol className="steps">
                <li><div><b>iPhone</b><span>Open this page in Safari → Share → “Add to Home Screen”.</span></div></li>
                <li><div><b>Android</b><span>Open in Chrome → ⋮ menu → “Install app”.</span></div></li>
              </ol>
            </div>
          </section>
        </div>
        <section className="card">
          <div className="hd"><h2>Move my ticks & ads to another device</h2></div>
          <div className="bd" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="muted">Your checklist, plan changes and ads are saved on this device. Copy them here and paste on the other device.</div>
            <textarea className="in" value={backup} onChange={(e) => setBackup(e.target.value)} placeholder="Press “Copy my data”, or paste data from the other device here" />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn dark" onClick={() => { const s = exportAll(); setBackup(s); navigator.clipboard?.writeText(s); setMsg("Copied. Paste it on the other device."); }}>Copy my data</button>
              <button className="btn" disabled={!backup} onClick={() => { try { const n = importAll(backup); setMsg(`Loaded ${n} items. Reloading…`); setTimeout(() => location.reload(), 800); } catch { setMsg("That text is not valid backup data."); } }}>Load pasted data</button>
            </div>
            {msg && <div className="note">{msg}</div>}
          </div>
        </section>
      </div>
    </>
  );
}
