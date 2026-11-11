"use client";
import { useEffect, useState } from "react";

// The site is static: GitHub Actions refreshes public/data.json every morning.
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const asset = (p: string | null) => (!p ? null : /^https?:/.test(p) ? p : `${BASE}/${p.replace(/^\//, "")}`);

export type Post = {
  id: string; caption: string | null; media_type: string; permalink: string | null; thumb: string | null;
  posted_at: string; likes: number; comments: number; reach: number; views: number; saves: number; shares: number;
};
export type Account = { day: string; followers: number; follows: number; media_count: number };
export type Data = { generatedAt: string; live: boolean; account: Account | null; posts: Post[]; error?: string };

let cache: Promise<Data> | null = null;

export function useData(): Data | null {
  const [d, setD] = useState<Data | null>(null);
  useEffect(() => {
    cache ??= fetch(`${BASE}/data.json`, { cache: "no-store" }).then((r) => r.json());
    cache.then(setD).catch(() => setD({ generatedAt: "", live: false, account: null, posts: [], error: "Could not load data" }));
  }, []);
  return d;
}
