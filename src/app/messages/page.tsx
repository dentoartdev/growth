import Replies from "@/components/Replies";

export default function Messages() {
  return (
    <>
      <header className="band">
        <div className="eyebrow">Messages</div>
        <h1>Instagram DMs</h1>
        <div className="sub">Ready-made replies now. Automatic replies after Meta approves the app.</div>
      </header>
      <div className="content">
        <div className="note">
          <b>Why replies are not automatic yet:</b> Instagram only lets an app read and answer DMs after Meta reviews and approves it (“App Review”).
          Until then, open the DM on your phone, tap a reply below to copy it, and paste. Answer within 1 hour — fast replies win the client.
        </div>
        <Replies />
        <section className="card">
          <div className="hd"><h2>Rules for every reply</h2></div>
          <div className="bd">
            <div className="tip do"><span className="dot" /><div><b>Reply in the same language and dialect they wrote in</b><p>Arabic to Arabic, English to English.</p></div></div>
            <div className="tip do"><span className="dot" /><div><b>Move doctors to WhatsApp</b><p>That’s where cases, photos and scans are easier to share.</p></div></div>
            <div className="tip urgent"><span className="dot" /><div><b>Patients: never give a diagnosis or a treatment plan</b><p>Kindly send them to their dentist, or offer to recommend a clinic you work with.</p></div></div>
          </div>
        </section>
      </div>
    </>
  );
}
