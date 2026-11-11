import { db } from "@/lib/db";
import AdsManager, { type Ad } from "@/components/AdsManager";

export const dynamic = "force-dynamic";

export default function Ads() {
  const ads = (db().prepare("SELECT * FROM ads ORDER BY COALESCE(start_day, created_at) DESC").all() as unknown as Ad[]).map((r) => ({ ...r }));
  const spend = ads.reduce((a, b) => a + b.spend, 0);
  const msgs = ads.reduce((a, b) => a + b.messages, 0);
  const clients = ads.reduce((a, b) => a + b.new_clients, 0);
  const live = ads.filter((a) => a.status === "running").length;
  return (
    <>
      <header className="band">
        <div className="eyebrow">Ads</div>
        <h1>Ads & results</h1>
        <div className="sub">Track every ad: what it cost and what it brought in.</div>
        <div className="kpis">
          <div className="kpi"><div className="l">Running now</div><div className="v">{live}</div><div className="d">{ads.length} ads in total</div></div>
          <div className="kpi"><div className="l">Total spent</div><div className="v">{Math.round(spend).toLocaleString("en-US")}<span style={{ fontSize: 14, color: "var(--dkmut)" }}> AED</span></div><div className="d">all ads</div></div>
          <div className="kpi"><div className="l">Messages</div><div className="v">{msgs}</div><div className="d">{msgs ? `${Math.round(spend / msgs)} AED per message` : "—"}</div></div>
          <div className="kpi"><div className="l">New clients</div><div className="v">{clients}</div><div className="d">{clients ? `${Math.round(spend / clients)} AED per client` : "—"}</div></div>
        </div>
      </header>
      <div className="content">
        <AdsManager ads={ads} />
        <div className="grid2">
          <section className="card">
            <div className="hd"><h2>How to run a good ad</h2></div>
            <div className="bd">
              <ol className="steps">
                <li><div><b>Boost a post that already works</b><span>Pick a post from “Best of the last 30 posts”. Never pay to push a weak post.</span></div></li>
                <li><div><b>Goal: Messages</b><span>Choose “More messages” so doctors land straight in your DMs or WhatsApp.</span></div></li>
                <li><div><b>Audience: dentists, not patients</b><span>UAE + Saudi + Kuwait, interests: dentistry, cosmetic dentistry, dental clinics. Age 26–55.</span></div></li>
                <li><div><b>Start small: 50–75 AED a day for 7 days</b><span>Then keep the ad with the lowest cost per message and stop the rest.</span></div></li>
                <li><div><b>Write the result here every few days</b><span>Spend, messages and new clients — the app works out what each one cost.</span></div></li>
              </ol>
            </div>
          </section>
          <section className="card">
            <div className="hd"><h2>Is my ad good?</h2></div>
            <div className="bd">
              <div className="tip do"><span className="dot" style={{ background: "var(--grn)" }} /><div><b>Good: under 15 AED per message</b><p>Keep it running and raise the budget slowly (+20% every 3 days).</p></div></div>
              <div className="tip do"><span className="dot" /><div><b>OK: 15–35 AED per message</b><p>Try a different picture or first line before spending more.</p></div></div>
              <div className="tip urgent"><span className="dot" /><div><b>Stop: over 35 AED, or no messages after 3 days</b><p>Turn it off and test another post.</p></div></div>
              <div className="note" style={{ marginTop: 10 }}>Rough guide for the Gulf dental market. The app learns your real numbers as you add ads.</div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
