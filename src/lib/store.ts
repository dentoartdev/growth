"use client";
import { useCallback, useEffect, useState } from "react";

// Things you tick or type are saved in this browser (this phone / this computer).
const PREFIX = "growth:";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useStored<T>(key: string, fallback: T): [T, (v: T | ((p: T) => T)) => void, boolean] {
  const [v, setV] = useState<T>(fallback);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setV(read(key, fallback));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback((n: T | ((p: T) => T)) => {
    setV((prev) => {
      const next = typeof n === "function" ? (n as (p: T) => T)(prev) : n;
      try { localStorage.setItem(PREFIX + key, JSON.stringify(next)); } catch { /* storage blocked — keep in memory */ }
      return next;
    });
  }, [key]);
  return [v, set, ready];
}

/** Everything saved on this device, for backup / moving to another device. */
export function exportAll(): string {
  const out: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith(PREFIX)) out[k] = JSON.parse(localStorage.getItem(k)!);
    }
  } catch { /* ignore */ }
  return JSON.stringify(out);
}

export function importAll(json: string): number {
  const obj = JSON.parse(json) as Record<string, unknown>;
  let n = 0;
  for (const [k, v] of Object.entries(obj)) {
    if (!k.startsWith(PREFIX)) continue;
    localStorage.setItem(k, JSON.stringify(v));
    n++;
  }
  return n;
}
