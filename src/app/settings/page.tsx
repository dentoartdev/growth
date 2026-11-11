import { getSetting, db } from "@/lib/db";
import { isConnected } from "@/lib/instagram";
import { prettyDate } from "@/lib/dates";
import ConnectForm from "@/components/ConnectForm";

export const dynamic = "force-dynamic";

export default function Settings() {
  const connected = isConnected();
  const at = getSetting("ig_connected_at");
  const runs = db().prepare("SELECT at, ok, message FROM sync_runs ORDER BY id DESC LIMIT 6").all() as { at: string; ok: number; message: string }[];
  return (
    <>
      <header className="band">
        <div className="eyebrow">Settings</div>
        <h1>Instagram connection</h1>
        <div className="sub"><span className={`livedot${connected ? "" : " off"}`} />{connected ? `Connected to @dentoart.dubai${at ? " since " + prettyDate(at) : ""}` : "Not connected"}</div>
      </header>
      <div className="content">
        <div className="grid2">
          <section className="card">
            <div className="hd"><h2>{connected ? "Sync & connection" : "Connect @dentoart.dubai"}</h2></div>
            <div className="bd"><ConnectForm connected={connected} /></div>
          </section>
          <section className="card">
            <div className="hd"><h2>How to get the token (5 min)</h2></div>
            <div className="bd">
              <ol className="steps">
                <li><div><b>Open developers.facebook.com → My Apps</b><span>Open the app “For photos Galary”.</span></div></li>
                <li><div><b>Instagram → API setup with Instagram login</b><span>Under “Generate access tokens”, press Generate next to @dentoart.dubai.</span></div></li>
                <li><div><b>Log in and allow</b><span>Tick basic + insights. Copy the long token it shows.</span></div></li>
                <li><div><b>Paste it here and press Connect</b><span>The app checks it is the right account, then pulls everything.</span></div></li>
              </ol>
            </div>
          </section>
        </div>
        <section className="card">
          <div className="hd"><h2>Sync history</h2></div>
          <div className="bd">
            {runs.length === 0 ? <div className="empty">No syncs yet.</div> : runs.map((r, i) => (
              <div key={i} className={`tip ${r.ok ? "" : "urgent"}`}><span className="dot" style={r.ok ? { background: "var(--grn)" } : undefined} />
                <div><b>{prettyDate(r.at)}</b><p>{r.message}</p></div></div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
