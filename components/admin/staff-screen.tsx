"use client";

import { BadgeCheck, UserRound } from "lucide-react";
import { TimeLabel } from "@/components/time-label";
import { shifts, staff } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const roleLabel: Record<string, string> = {
  KASIR: "Kasir",
  KITCHEN: "Dapur",
  WAITER: "Waiter",
  ADMIN: "Admin",
  BARISTA: "Barista",
};

export function StaffScreen() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Staff</h1>
        <p className="text-sm text-muted-foreground">
          {staff.length} anggota tim terdaftar.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2.5">Nama</th>
              <th className="px-4 py-2.5">Peran</th>
              <th className="px-4 py-2.5">Shift</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <UserRound className="size-4" aria-hidden />
                    </span>
                    <span className="font-semibold">{s.name}</span>
                  </span>
                </td>
                <td className="px-4 py-3">{roleLabel[s.role]}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.shift}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                      s.active
                        ? "bg-status-available-bg text-status-available-fg"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <BadgeCheck className="size-3" aria-hidden />
                    {s.active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-heading text-lg font-extrabold">Jadwal Shift</h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {shifts.map((sh) => {
          const person = staff.find((s) => s.id === sh.staffId);
          return (
            <li
              key={sh.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="font-heading font-bold">{person?.name}</p>
              <p className="tnum mt-1 text-sm text-muted-foreground">
                {sh.clockIn} — {sh.clockOut ?? "berjalan"}
              </p>
              <p className="text-xs text-muted-foreground">
                <TimeLabel iso={sh.date} variant="date" />
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
