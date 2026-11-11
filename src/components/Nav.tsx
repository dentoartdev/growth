"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const I = {
  today: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  plan: <><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></>,
  posts: <><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></>,
  ads: <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" />,
  inbox: <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1z" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
};

const icon = (p: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{p}</svg>
);

const ITEMS = [
  { href: "/", label: "Today", icon: I.today },
  { href: "/plan", label: "Plan", icon: I.plan },
  { href: "/posts", label: "Posts", icon: I.posts },
  { href: "/ads", label: "Ads", icon: I.ads },
  { href: "/messages", label: "Messages", icon: I.inbox },
];

export function SideNav() {
  const p = usePathname();
  const on = (h: string) => (h === "/" ? p === "/" : p.startsWith(h));
  return (
    <aside className="side">
      <div className="brand">
        <div className="n">Growth <i /></div>
        <div className="t">Instagram coach · @dentoart.dubai</div>
      </div>
      <nav className="nav">
        {[...ITEMS, { href: "/settings", label: "Settings", icon: I.settings }].map((it) => (
          <Link key={it.href} href={it.href} className={on(it.href) ? "on" : ""}>{icon(it.icon)}<span>{it.label}</span></Link>
        ))}
      </nav>
      <div className="foot"><img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/logo-black.png`} alt="Dento Art" /></div>
    </aside>
  );
}

export function TabBar() {
  const p = usePathname();
  const on = (h: string) => (h === "/" ? p === "/" : p.startsWith(h));
  return (
    <nav className="tabs">
      {ITEMS.map((it) => (
        <Link key={it.href} href={it.href} className={on(it.href) ? "on" : ""}>{icon(it.icon)}<span>{it.label}</span></Link>
      ))}
    </nav>
  );
}

export const SettingsIcon = () => icon(I.settings);
