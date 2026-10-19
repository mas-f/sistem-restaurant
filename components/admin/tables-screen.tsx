"use client";

import { QrCode, Users } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { TimeLabel } from "@/components/time-label";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function TablesScreen() {
  const { tables, sessions, openTable } = useStore();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Meja</h1>
          <p className="text-sm text-muted-foreground">
            Kelola status &amp; kapasitas meja.
          </p>
        </div>
        <a
          href="/admin/tables/qr"
          className="flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <QrCode className="size-4" aria-hidden /> Kelola QR
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {tables.map((t, i) => {
          const sess = sessions.find((s) => s.tableId === t.id);
          return (
            <div
              key={t.id}
              className={cn(
                "animate-rise rounded-xl border border-border bg-card p-4",
                `stagger-${Math.min(i % 5, 4)}`
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-extrabold">
                  {t.code}
                </span>
                <StatusBadge status={t.status} compact />
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" aria-hidden />
                {t.seats} kursi · {t.area}
              </p>
              <div className="mt-3">
                <StatusBadge status={t.status} />
              </div>
              {sess && (
                <p className="tnum mt-2 text-xs text-muted-foreground">
                  {sess.guests} tamu · sejak <TimeLabel iso={sess.startedAt} />
                </p>
              )}
              {t.status === "AVAILABLE" && (
                <button
                  onClick={() => openTable(t.id)}
                  className="mt-3 h-8 w-full rounded-full border border-border text-xs font-bold hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  Buka Sesi
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
