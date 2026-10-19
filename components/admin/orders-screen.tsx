"use client";

import { useMemo, useState } from "react";
import { ClipboardList, Search } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { SignOutButton } from "@/components/sign-out-button";
import { TimeLabel } from "@/components/time-label";
import { rupiah } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const filters: { key: "ALL" | OrderStatus; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "PENDING", label: "Baru" },
  { key: "CONFIRMED", label: "Dikonfirmasi" },
  { key: "PREPARING", label: "Memasak" },
  { key: "READY", label: "Siap" },
  { key: "COMPLETED", label: "Selesai" },
];

export function OrdersScreen() {
  const { orders } = useStore();
  const [f, setF] = useState<(typeof filters)[number]["key"]>("ALL");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return orders.filter((o) => {
      if (f !== "ALL" && o.status !== f) return false;
      if (query && !`${o.code} ${o.tableCode}`.toLowerCase().includes(query))
        return false;
      return true;
    });
  }, [orders, f, q]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Semua pesanan lintas meja, satu sumber kebenaran dengan dapur &amp; kasir.
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari order / meja…"
            aria-label="Cari order"
            className="h-9 w-full rounded-full border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map((x) => (
            <button
              key={x.key}
              onClick={() => setF(x.key)}
              aria-pressed={f === x.key}
              className={cn(
                "h-8 rounded-full border px-3 text-xs font-bold transition",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                f === x.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent/50"
              )}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <ClipboardList className="size-6 text-muted-foreground" aria-hidden />
            <p className="text-sm font-semibold">Tidak ada order</p>
            <p className="text-xs text-muted-foreground">
              Coba ubah filter atau kata kunci.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2.5">Order</th>
                  <th className="px-4 py-2.5">Meja</th>
                  <th className="px-4 py-2.5">Item</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                  <th className="px-4 py-2.5">Waktu</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((o) => {
                  const total = o.items.reduce(
                    (s, i) => s + (i.unitPrice + i.modifierDelta) * i.quantity,
                    0
                  );
                  return (
                    <tr key={o.id} className="hover:bg-secondary/40">
                      <td className="tnum px-4 py-3 font-semibold">
                        {o.code}
                      </td>
                      <td className="px-4 py-3 font-bold">{o.tableCode}</td>
                      <td className="max-w-56 truncate px-4 py-3 text-muted-foreground">
                        {o.items
                          .map((i) => `${i.quantity}× ${i.productName}`)
                          .join(", ")}
                      </td>
                      <td className="tnum px-4 py-3 text-right font-bold">
                        {rupiah(total)}
                      </td>
                      <td className="tnum px-4 py-3 text-muted-foreground">
                        <TimeLabel iso={o.createdAt} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
