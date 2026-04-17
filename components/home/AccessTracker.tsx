"use client";

import { useEffect } from "react";

const KEY = "farolfix_access_tracked";

export function AccessTracker() {
  useEffect(() => {
    const tracked = sessionStorage.getItem(KEY);
    if (tracked) return;

    fetch("/api/track-access", { method: "POST" }).catch(() => undefined);
    sessionStorage.setItem(KEY, "1");
  }, []);

  return null;
}
