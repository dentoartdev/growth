import "server-only";
import { db } from "./db";
import { addDays, weekStart } from "./dates";

// The weekly rhythm: 4 posts + daily Stories. Each slot has a job.
export const WEEK_RHYTHM = [
  { offset: 0, slot: "Mon", format: "Reel", pillar: "Transformation", best_time: "8:00 PM" },
  { offset: 2, slot: "Wed", format: "Carousel", pillar: "Education", best_time: "1:00 PM" },
  { offset: 4, slot: "Fri", format: "Reel", pillar: "Inside the lab", best_time: "8:00 PM" },
  { offset: 5, slot: "Sat", format: "Photo", pillar: "Question", best_time: "7:00 PM" },
] as const;

type Idea = { title: string; hook: string; caption: string; cta: string };

// Idea bank per pillar. The planner cycles through these week by week.
const IDEAS: Record<string, Idea[]> = {
  Transformation: [
    { title: "Before / after smile — 8 E.max veneers", hook: "She hid her smile for 10 years.", caption: "From worn and dark to natural and bright. Every veneer layered by hand in our Dubai lab.", cta: "Doctors: send us your next smile case." },
    { title: "Full-arch implant case reveal", hook: "12 units. One hand.", caption: "A full-mouth implant restoration, from scan to final delivery.", cta: "Send your implant case — we reply within the day." },
    { title: "Shade match on a single central", hook: "The hardest tooth in dentistry.", caption: "One crown next to natural teeth. Can you tell which one we made?", cta: "Comment the number you think is the crown." },
    { title: "Patient reaction Reel", hook: "Watch her face at second 5.", caption: "The moment a patient sees her new smile for the first time.", cta: "Save this for your next patient consult." },
  ],
  Education: [
    { title: "White is not one color", hook: "Why your crowns look fake.", caption: "Natural teeth have blue edges, warm necks and white spots. Swipe to see how we copy each one.", cta: "Save this before your next shade photo." },
    { title: "How to take a shade photo (5 steps)", hook: "Bad shade photo = wrong crown.", caption: "The 5 rules we give every clinic we work with.", cta: "Send this to your assistant." },
    { title: "E.max vs zirconia — when to use which", hook: "Most labs won’t tell you this.", caption: "A simple guide for doctors choosing a material.", cta: "Questions? Send us a DM." },
    { title: "What a good scan looks like", hook: "We reject 1 in 10 scans. Here’s why.", caption: "Margins, bite and contacts — what we need to make it perfect the first time.", cta: "Save for your next scan." },
  ],
  "Inside the lab": [
    { title: "Layering a veneer in 30 seconds", hook: "4 hours of work in 30 seconds.", caption: "Micro-layering E.max, one layer at a time.", cta: "Follow for more lab process." },
    { title: "Meet the technician", hook: "The hands behind your smile.", caption: "15 years of ceramics. This is who builds your cases.", cta: "Say hi in the comments." },
    { title: "From scan to box", hook: "Your case’s 5-day journey.", caption: "What happens to a case after the doctor presses send.", cta: "Send a case and track it from start to finish." },
    { title: "Glazing day", hook: "The last 10% that makes 90% of the look.", caption: "Surface texture and glaze — the step that makes ceramics look alive.", cta: "Save this." },
  ],
  Question: [
    { title: "A or B — which smile do you like?", hook: "Which one would you choose?", caption: "Two designs for the same patient. Vote in the comments: A or B?", cta: "Comment A or B." },
    { title: "Guess the material", hook: "E.max or zirconia?", caption: "Look closely and guess. Answer in tomorrow’s Story.", cta: "Comment your guess." },
    { title: "Natural or crown?", hook: "One of these is not a real tooth.", caption: "Can you spot the crown?", cta: "Comment the number." },
    { title: "What should we show next?", hook: "You choose our next post.", caption: "Implants, veneers or full-mouth? Tell us what you want to see.", cta: "Comment your pick." },
  ],
};

export type PlanItem = {
  id: number; day: string; slot: string; format: string; pillar: string; title: string; hook: string | null;
  caption: string | null; cta: string | null; best_time: string | null; status: string; notes: string | null;
};

/** Make sure the next `weeks` weeks (starting this week) have a plan. Never overwrites existing items. */
export function ensurePlan(today: string, weeks = 4) {
  const d = db();
  const first = weekStart(today);
  // A stable week number so the idea bank rotates.
  const weekNo = (day: string) => Math.floor(new Date(day + "T12:00:00Z").getTime() / (7 * 86400000));
  const insert = d.prepare(
    "INSERT INTO plan_items (day, slot, format, pillar, title, hook, caption, cta, best_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (let w = 0; w < weeks; w++) {
    const ws = addDays(first, w * 7);
    const exists = d.prepare("SELECT 1 FROM plan_items WHERE day >= ? AND day < ? LIMIT 1").get(ws, addDays(ws, 7));
    if (exists) continue;
    for (const r of WEEK_RHYTHM) {
      const bank = IDEAS[r.pillar];
      const idea = bank[weekNo(ws) % bank.length];
      insert.run(addDays(ws, r.offset), r.slot, r.format, r.pillar, idea.title, idea.hook, idea.caption, idea.cta, r.best_time);
    }
  }
}

export function planBetween(from: string, to: string): PlanItem[] {
  return (db().prepare("SELECT * FROM plan_items WHERE day >= ? AND day <= ? ORDER BY day, id").all(from, to) as unknown as PlanItem[]).map((r) => ({ ...r }));
}

// Daily habits shown on Today, on top of the day's planned post.
export const DAILY_HABITS = [
  { key: "stories", label: "Post 3–5 Stories (lab, cases, team)" },
  { key: "replies", label: "Reply to every comment and DM" },
  { key: "engage", label: "Like & comment on 10 doctor / clinic accounts" },
];
