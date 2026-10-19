"use client";

import { CalendarClock } from "lucide-react";
import { TimeLabel } from "@/components/time-label";
import { shifts, staff } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ShiftsScreen() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Shift</h1>
        <p className="text-sm text-muted-foreground">
          Jadwal clock-in/out seluruh staff.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2.5">Staff</th>
              <th className="px-4 py-2.5">Tanggal</th>
              <th className="px-4 py-2.5">Masuk</th>
              <th className="px-4 py-2.5">Keluar</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shifts.map((sh) => {
              const person = staff.find((s) => s.id === sh.staffId);
              const running = sh.clockOut === null;
              return (
                <tr key={sh.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3 font-semibold">{person?.name}</td>
                  <td className="tnum px-4 py-3 text-muted-foreground">
                    <TimeLabel iso={sh.date} variant="date" />
                  </td>
                  <td className="tnum px-4 py-3">{sh.clockIn}</td>
                  <td className="tnum px-4 py-3">
                    {sh.clockOut ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                        running
                          ? "bg-status-available-bg text-status-available-fg"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <CalendarClock className="size-3" aria-hidden />
                      {running ? "Berjalan" : "Selesai"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
