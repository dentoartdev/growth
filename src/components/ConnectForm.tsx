"use client";
import { useState, useTransition } from "react";
import { connectInstagram, disconnectInstagram, runSync } from "@/app/actions";

export default function ConnectForm({ connected }: { connected: boolean }) {
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {connected ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn gold" disabled={pending} onClick={() => start(async () => setMsg(await runSync()))}>{pending ? "Syncing…" : "Sync now"}</button>
          <button className="btn" disabled={pending} onClick={() => { if (confirm("Disconnect Instagram?")) start(async () => { await disconnectInstagram(); setMsg(null); }); }}>Disconnect</button>
        </div>
      ) : (
        <>
          <input className="in" type="password" autoComplete="off" placeholder="Paste the Instagram access token" value={token} onChange={(e) => setToken(e.target.value)} />
          <div><button className="btn gold" disabled={pending || !token} onClick={() => start(async () => { const r = await connectInstagram(token); setMsg(r); if (r.ok) setToken(""); })}>{pending ? "Checking…" : "Connect"}</button></div>
        </>
      )}
      {msg && <div className={`note${msg.ok ? "" : " warn"}`}>{msg.message}</div>}
      <div className="faint" style={{ fontSize: 12.5 }}>The token stays on this computer and is never shown again.</div>
    </div>
  );
}
