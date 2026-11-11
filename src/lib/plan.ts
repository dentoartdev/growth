import { addDays, parseDay } from "./dates";

// The weekly rhythm: 4 posts + daily Stories. Each slot has a job.
export const WEEK_RHYTHM = [
  { offset: 0, slot: "Mon", format: "Reel", pillar: "Transformation", best_time: "8:00 PM" },
  { offset: 2, slot: "Wed", format: "Carousel", pillar: "Education", best_time: "1:00 PM" },
  { offset: 4, slot: "Fri", format: "Reel", pillar: "Inside the lab", best_time: "8:00 PM" },
  { offset: 5, slot: "Sat", format: "Photo", pillar: "Question", best_time: "7:00 PM" },
] as const;

type Idea = { title: string; hook: string; caption: string; cta: string };

// Idea bank per pillar. The planner rotates through these week by week.
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
  id: string; day: string; slot: string; format: string; pillar: string; title: string; hook: string;
  caption: string; cta: string; best_time: string; status: string; notes: string;
};

/** Saved changes per item (status, edits), kept in this browser. */
export type PlanEdits = Record<string, Partial<Pick<PlanItem, "status" | "title" | "hook" | "caption" | "cta" | "notes">>>;

const weekNo = (monday: string) => Math.floor(parseDay(monday).getTime() / (7 * 86400000));

/** The 4 planned posts for the week that starts on `monday`, with any saved edits applied. */
export function weekPlan(monday: string, edits: PlanEdits = {}): PlanItem[] {
  return WEEK_RHYTHM.map((r) => {
    const bank = IDEAS[r.pillar];
    const idea = bank[weekNo(monday) % bank.length];
    const day = addDays(monday, r.offset);
    const id = `${day}-${r.slot}`;
    return { id, day, slot: r.slot, format: r.format, pillar: r.pillar, best_time: r.best_time, status: "idea", notes: "", ...idea, ...edits[id] };
  });
}

// Daily habits shown on Today, on top of the day's planned post.
export const DAILY_HABITS = [
  { key: "stories", label: "Post 3–5 Stories (lab, cases, team)" },
  { key: "replies", label: "Reply to every comment and DM" },
  { key: "engage", label: "Like & comment on 10 doctor / clinic accounts" },
];
