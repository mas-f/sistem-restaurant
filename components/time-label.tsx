"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Waktu absolut hanya dirender setelah mount. Timestamp mock digeser relatif
// terhadap waktu muat modul (lib/mock-data), sehingga hasil render server dan
// klien bisa berbeda — tanpa gating ini akan terjadi hydration mismatch.
export function TimeLabel({
  iso,
  variant = "time",
  className,
}: {
  iso: string;
  variant?: "time" | "date";
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return <span className={cn("tnum", className)}>—</span>;
  }

  const d = variant === "date" ? new Date(`${iso}T00:00:00`) : new Date(iso);

  return (
    <span className={cn("tnum", className)}>
      {variant === "date"
        ? d.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : d.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })}
    </span>
  );
}
