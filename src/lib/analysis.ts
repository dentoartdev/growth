import type { Post, Account } from "./data";
import { dubaiDay, daysBetween, addDays, fmt } from "./dates";

export const TARGET_POSTS_PER_WEEK = 4;

// What a post is "about", guessed from its caption. Kept simple and readable.
export type Topic = "Transformation" | "Education" | "Question" | "Offer / CTA" | "Showcase";

export function topicOf(caption: string | null): Topic {
  const c = (caption || "").toLowerCase();
  if (/before|after|transform|smile makeover|patient|قبل|بعد/.test(c)) return "Transformation";
  if (/\?|which one|do you like|guess|choose|vote/.test(c)) return "Question";
  if (/price|offer|discount|contact|dm us|whatsapp|book|call us|سعر|اسعار|تواصل/.test(c)) return "Offer / CTA";
  if (/how|why|tip|layer|shade|technique|step|process|learn|myth|truth/.test(c)) return "Education";
  return "Showcase";
}

export function formatOf(t: string): "Reel" | "Carousel" | "Photo" {
  return t === "VIDEO" ? "Reel" : t === "CAROUSEL_ALBUM" ? "Carousel" : "Photo";
}

export type ScoredPost = Post & {
  format: "Reel" | "Carousel" | "Photo"; topic: Topic; engagement: number; rate: number;
  verdict: "Top" | "Good" | "Average" | "Weak";
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function scoredPosts(posts: Post[]): ScoredPost[] {
  // Compare against the MEDIAN of the last 60 posts, so one viral post doesn't make everything look weak.
  const recent = posts.slice(0, 60).map((p) => p.reach).sort((a, b) => a - b);
  const base = recent.length ? recent[Math.floor(recent.length / 2)] || 1 : 1;
  return posts.map((p) => {
    const engagement = p.likes + p.comments + p.saves + p.shares;
    const rate = p.reach ? engagement / p.reach : 0;
    const ratio = p.reach / base;
    const verdict = ratio >= 2 ? "Top" : ratio >= 1.15 ? "Good" : ratio >= 0.7 ? "Average" : "Weak";
    return { ...p, format: formatOf(p.media_type), topic: topicOf(p.caption), engagement, rate, verdict };
  });
}

export type Group = { key: string; posts: number; avgReach: number; avgSaves: number; avgRate: number };

function groupBy(posts: ScoredPost[], key: (p: ScoredPost) => string): Group[] {
  const m = new Map<string, ScoredPost[]>();
  for (const p of posts) m.set(key(p), [...(m.get(key(p)) || []), p]);
  return [...m.entries()]
    .map(([k, ps]) => ({ key: k, posts: ps.length, avgReach: avg(ps.map((p) => p.reach)), avgSaves: avg(ps.map((p) => p.saves)), avgRate: avg(ps.map((p) => p.rate)) }))
    .sort((a, b) => b.avgReach - a.avgReach);
}

export type Tip = { level: "urgent" | "do" | "idea"; title: string; why: string };

export function overview(raw: Post[], snap: Account | null, live: boolean, today: string = dubaiDay()) {
  const posts = scoredPosts(raw);
  const last = posts[0];
  const lastDay = last ? dubaiDay(new Date(last.posted_at)) : null;
  const daysSinceLast = lastDay ? daysBetween(lastDay, today) : null;

  const inWindow = (p: ScoredPost, from: string, to: string) => {
    const d = dubaiDay(new Date(p.posted_at));
    return d > from && d <= to;
  };
  const last30 = posts.filter((p) => inWindow(p, addDays(today, -30), today));
  const prev30 = posts.filter((p) => inWindow(p, addDays(today, -60), addDays(today, -30)));

  // Compare on "the last 10 posts" too, so a quiet month still has a trend line.
  const recent10 = posts.slice(0, 10);
  const older = posts.slice(10, 60);
  const recentReach = avg(recent10.map((p) => p.reach));
  const olderReach = avg(older.map((p) => p.reach));

  const ws = addDays(today, -6);
  const postsThisWeek = posts.filter((p) => inWindow(p, addDays(ws, -1), today)).length;

  const byFormat = groupBy(posts.slice(0, 120), (p) => p.format);
  const byTopic = groupBy(posts.slice(0, 120), (p) => p.topic);


  const best = [...posts].sort((a, b) => b.reach - a.reach).slice(0, 6);
  const bestRecent = [...posts.slice(0, 30)].sort((a, b) => b.reach - a.reach).slice(0, 3);

  // ---- Coach tips: plain rules over the numbers ----
  const tips: Tip[] = [];
  if (!live)
    tips.push({ level: "urgent", title: "Connect Instagram for live numbers", why: "The numbers here are from the last import. Connect in Settings so the coach sees what you posted since then." });
  if (live && daysSinceLast !== null && daysSinceLast > 4)
    tips.push({ level: "urgent", title: `Post today — it has been ${daysSinceLast} days`, why: "The account loses reach every day it stays silent. Instagram shows active accounts first." });
  if (live && postsThisWeek < TARGET_POSTS_PER_WEEK)
    tips.push({ level: "do", title: `${TARGET_POSTS_PER_WEEK - postsThisWeek} more posts needed this week`, why: `The target is ${TARGET_POSTS_PER_WEEK} posts a week: 2 Reels, 1 carousel, 1 question post.` });
  const reel = byFormat.find((g) => g.key === "Reel");
  const photo = byFormat.find((g) => g.key === "Photo");
  if (reel && photo && reel.avgReach > photo.avgReach * 1.3)
    tips.push({ level: "do", title: "Fewer single photos, more Reels", why: `Reels reach ${fmt(reel.avgReach)} on average; single photos only ${fmt(photo.avgReach)}.` });
  const sameTopic = recent10.filter((p) => p.topic === recent10[0]?.topic).length;
  if (sameTopic >= 7)
    tips.push({ level: "do", title: "Change the type of content", why: `${sameTopic} of the last 10 posts are the same kind (${recent10[0].topic}). Followers stop reacting to repeats.` });
  if (olderReach && recentReach < olderReach * 0.8)
    tips.push({ level: "urgent", title: "Reach is dropping", why: `The last 10 posts average ${fmt(recentReach)} reach vs ${fmt(olderReach)} before. Mix in transformations and questions.` });
  const questions = posts.slice(0, 30).filter((p) => p.topic === "Question").length;
  if (questions < 2)
    tips.push({ level: "idea", title: "Ask followers a question", why: "Posts like “Which one do you like, A or B?” got some of the biggest reach and saves in the account’s history." });
  const ctas = posts.slice(0, 30).filter((p) => p.topic === "Offer / CTA").length;
  if (ctas < 2)
    tips.push({ level: "idea", title: "Tell doctors how to work with you", why: "Almost no recent post says how to send a case or contact the lab. Add one clear call to action a week." });
  tips.push({ level: "idea", title: "Stories every day (3–5)", why: "Behind-the-scenes Stories keep followers close between posts and cost nothing to make." });

  return {
    today, last, daysSinceLast, postsThisWeek, last30, prev30, recentReach, olderReach,
    byFormat, byTopic, best, bestRecent, tips, snap, total: posts.length,
    avgReach30: avg(last30.map((p) => p.reach)), avgReachPrev30: avg(prev30.map((p) => p.reach)),
  };
}

