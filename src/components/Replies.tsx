"use client";
import { useState } from "react";

const REPLIES = [
  { who: "Doctor", q: "How do I send you a case?", ar: "أهلاً دكتور، تقدر ترسل السكان من iTero أو 3Shape أو Medit مباشرة لحسابنا، أو ترسله على الواتساب مع صور المريض. نرجعلك بنفس اليوم بالتفاصيل.", en: "Hi Doctor, you can send the scan directly from iTero, 3Shape or Medit, or share it with us on WhatsApp with the patient photos. We’ll get back to you the same day." },
  { who: "Doctor", q: "What are your prices?", ar: "أهلاً دكتور، الأسعار تختلف حسب نوع الشغل والكمية. ممكن رقم الواتساب حتى نرسلك قائمة الأسعار كاملة؟", en: "Hi Doctor, prices depend on the type of work and volume. Could you share your WhatsApp so we can send you our full price list?" },
  { who: "Doctor", q: "How long does a case take?", ar: "عادةً الحالة تاخذ من ٥ إلى ٧ أيام عمل من استلام السكان، ونشحن داخل الإمارات وللخليج.", en: "A case usually takes 5–7 working days from when we receive the scan. We ship across the UAE and the Gulf." },
  { who: "Doctor", q: "Where are you located?", ar: "مختبرنا بدبي — برج الصقر للأعمال، شارع الشيخ زايد، مكتب ١٧٠١. حياك من الاثنين للسبت، ١٠ الصبح لـ ٦ المسا.", en: "Our lab is in Dubai — Al Saqr Business Tower, Sheikh Zayed Road, Office 1701. Open Monday to Saturday, 10 AM – 6 PM." },
  { who: "Patient", q: "I want veneers, how much?", ar: "أهلاً بيك! إحنا مختبر نشتغل ويا أطباء الأسنان مباشرة. إذا تحب، نگدر ننطيك اسم عيادة نشتغل وياها بمدينتك حتى يشوفك الدكتور.", en: "Hi! We’re a dental lab and work directly with dentists. If you like, we can recommend a clinic we work with in your city." },
  { who: "Anyone", q: "Thank you / compliment", ar: "تسلم، هذا من ذوقك! نتشرف بمتابعتك.", en: "Thank you so much! We really appreciate your support." },
];

export default function Replies() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [copied, setCopied] = useState<number | null>(null);
  return (
    <section className="card">
      <div className="hd"><h2>Quick replies</h2>
        <div className="filters" style={{ marginLeft: "auto" }}>
          <a href="#" className={lang === "ar" ? "on" : ""} onClick={(e) => { e.preventDefault(); setLang("ar"); }}>Arabic</a>
          <a href="#" className={lang === "en" ? "on" : ""} onClick={(e) => { e.preventDefault(); setLang("en"); }}>English</a>
        </div>
      </div>
      <div className="bd" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {REPLIES.map((r, i) => (
          <div key={i}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span className={`tag ${r.who === "Doctor" ? "gold" : r.who === "Patient" ? "slate" : ""}`}>{r.who}</span>
              <b style={{ fontSize: 13.5 }}>{r.q}</b>
            </div>
            <button type="button" className="copy" style={{ width: "100%", textAlign: lang === "ar" ? "right" : "left", cursor: "pointer", direction: lang === "ar" ? "rtl" : "ltr" }}
              onClick={() => { navigator.clipboard.writeText(r[lang]); setCopied(i); setTimeout(() => setCopied(null), 1500); }}>
              {r[lang]}
              <span className="tag grn" style={{ position: "absolute", top: -9, [lang === "ar" ? "left" : "right"]: 10, opacity: copied === i ? 1 : 0, transition: "opacity .2s" }}>Copied ✓</span>
            </button>
          </div>
        ))}
        <div className="faint" style={{ fontSize: 12.5 }}>Tap a reply to copy it.</div>
      </div>
    </section>
  );
}
