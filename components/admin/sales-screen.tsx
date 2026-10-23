"use client";

import {
  BarChart3,
  QrCode,
  Banknote,
  TrendingUp,
} from "lucide-react";
import { rupiah } from "@/lib/format";
import type { Order, PaymentMethod, PaymentView } from "@/lib/types";
import { cn } from "@/lib/utils";

const methodMeta: Record<
  PaymentMethod,
  { label: string; icon: typeof Banknote }
> = {
  QRIS: { label: "QRIS", icon: QrCode },
  CASH: { label: "Tunai", icon: Banknote },
};

type SalesScreenProps = {
  orders: Order[];
  payments: PaymentView[];
};

export function SalesScreen({ orders, payments }: SalesScreenProps) {
  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const byMethod = Object.entries(
    payments.reduce<Record<string, number>>((acc, p) => {
      acc[p.method] = (acc[p.method] ?? 0) + p.amount;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  // Best sellers dari orders
  const best = Object.values(
    orders.reduce<Record<string, { name: string; qty: number; revenue: number }>>(
      (acc, o) => {
        for (const it of o.items) {
          acc[it.productId] ??= {
            name: it.productName,
            qty: 0,
            revenue: 0,
          };
          acc[it.productId].qty += it.quantity;
          acc[it.productId].revenue +=
            (it.unitPrice + it.modifierDelta) * it.quantity;
        }
        return acc;
      },
      {}
    )
  )
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const maxRev = Math.max(...byMethod.map(([, v]) => v), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">
          Sales Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Performa penjualan dan metode pembayaran hari ini.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 lg:col-span-1">
          <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <TrendingUp className="size-4 text-status-ready-fg" aria-hidden />
            Total Pendapatan
          </p>
          <p className="tnum mt-2 font-heading text-3xl font-extrabold text-primary">
            {rupiah(totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {payments.length} transaksi hari ini
          </p>

          <div className="mt-5 space-y-3">
            <h2 className="font-heading text-sm font-extrabold">
              Metode Pembayaran
            </h2>
            {byMethod.map(([m, v]) => {
              const meta = methodMeta[m as PaymentMethod];
              const Icon = meta.icon;
              return (
                <div key={m}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium">
                      <Icon className="size-4 text-muted-foreground" aria-hidden />
                      {meta.label}
                    </span>
                    <span className="tnum font-bold">{rupiah(v)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(v / maxRev) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <section
            aria-label="Menu terlaris"
            className="rounded-xl border border-border bg-card p-5"
          >
            <h2 className="font-heading mb-3 flex items-center gap-2 text-sm font-extrabold">
              <BarChart3 className="size-4 text-primary" aria-hidden />
              Menu Terlaris
            </h2>
            <ul className="divide-y divide-border">
              {best.map((b, i) => (
                <li key={b.name} className="flex items-center gap-3 py-2.5">
                  <span
                    className={cn(
                      "tnum flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
                      i === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {b.name}
                  </span>
                  <span className="tnum text-xs text-muted-foreground">
                    {b.qty} terjual
                  </span>
                  <span className="tnum text-sm font-bold text-primary">
                    {rupiah(b.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-label="Transaksi terakhir"
            className="rounded-xl border border-border bg-card p-5"
          >
            <h2 className="font-heading mb-3 text-sm font-extrabold">
              Transaksi Terakhir
            </h2>
            <ul className="divide-y divide-border">
              {payments.slice(-5).reverse().map((p) => {
                const meta = methodMeta[p.method];
                const Icon = meta.icon;
                return (
                  <li key={p.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="tnum font-semibold">{p.code}</span>
                    <span className="text-muted-foreground">
                      Meja {p.tableCode}
                    </span>
                    <span className="ml-auto flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {meta.label}
                      </span>
                      <span className="tnum font-bold">
                        {rupiah(p.amount)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
