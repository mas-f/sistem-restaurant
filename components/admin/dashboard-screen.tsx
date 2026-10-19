"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Flame,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { TimeLabel } from "@/components/time-label";
import { ingredients, products, rupiah } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DashboardScreen() {
  const { orders, payments, tables } = useStore();
  const todayRevenue = payments.reduce((s, p) => s + p.amount, 0);
  const activeOrders = orders.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
  );
  const occupied = tables.filter((t) => t.status === "OCCUPIED").length;
  const waiting = tables.filter((t) => t.status === "WAITING_PAYMENT").length;
  const lowStock = ingredients.filter((i) => i.stock < i.minStock);
  const unavailable = products.filter((p) => !p.available);

  const kpis = [
    {
      label: "Pendapatan Hari Ini",
      value: rupiah(todayRevenue),
      delta: "+12,4% vs kemarin",
      icon: TrendingUp,
      tone: "text-status-ready-fg bg-status-available-bg",
    },
    {
      label: "Pesanan Aktif",
      value: String(activeOrders.length),
      delta: `${orders.length} total hari ini`,
      icon: Flame,
      tone: "text-status-preparing-fg bg-status-waiting-bg",
    },
    {
      label: "Meja Terisi",
      value: `${occupied}/${tables.length}`,
      delta: waiting > 0 ? `${waiting} menunggu bayar` : "semua lancar",
      icon: Users,
      tone: "text-status-occupied-fg bg-status-occupied-bg",
    },
    {
      label: "Stok Kritis",
      value: String(lowStock.length),
      delta: "bahan perlu restock",
      icon: AlertTriangle,
      tone: "text-status-error-fg bg-status-error-bg",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan operasional RestoFlow Bistro hari ini.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className={cn(
                "animate-rise rounded-xl border border-border bg-card p-4",
                "shadow-[0_2px_4px_-1px_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)]",
                `stagger-${Math.min(i, 4)}`
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {k.label}
                </p>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    k.tone
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
              </div>
              <p className="tnum mt-2 font-heading text-xl font-extrabold">
                {k.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{k.delta}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Order aktif */}
        <section
          aria-label="Pesanan aktif"
          className="rounded-xl border border-border bg-card p-4"
        >
          <header className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm font-extrabold">
              Pesanan Aktif
            </h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              Lihat semua <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          </header>
          {activeOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <CheckCircle2
                className="size-6 text-status-available-fg"
                aria-hidden
              />
              <p className="text-sm font-semibold">Semua pesanan selesai</p>
              <p className="text-xs text-muted-foreground">
                Tidak ada order aktif saat ini.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {activeOrders.slice(0, 6).map((o) => (
                <li
                  key={o.id}
                  className="flex items-center gap-3 py-2.5 text-sm"
                >
                  <ReceiptText
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="tnum truncate font-semibold">{o.code}</p>
                    <p className="text-xs text-muted-foreground">
                      Meja {o.tableCode} · {o.items.length} item
                    </p>
                  </div>
                  <StatusBadge status={o.status} compact />
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    <TimeLabel iso={o.createdAt} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Stok kritis */}
        <section
          aria-label="Peringatan stok"
          className="rounded-xl border border-border bg-card p-4"
        >
          <header className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm font-extrabold">
              Peringatan Stok
            </h2>
            <Link
              href="/admin/inventory"
              className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              Inventaris <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          </header>
          <ul className="space-y-3">
            {lowStock.map((ing) => {
              const pct = Math.min(100, (ing.stock / ing.minStock) * 100);
              return (
                <li key={ing.id}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="truncate font-semibold">{ing.name}</span>
                    <span className="tnum shrink-0 text-xs font-bold text-status-error-fg">
                      {ing.stock} {ing.unit} / min {ing.minStock}
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={Math.round(pct)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Stok ${ing.name}`}
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="h-full rounded-full bg-status-error"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
            {unavailable.length > 0 && (
              <li className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                <strong className="text-foreground">
                  {unavailable.length} menu habis
                </strong>{" "}
                : {unavailable.map((p) => p.name).join(", ")}
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* Status meja strip */}
      <section
        aria-label="Status meja"
        className="rounded-xl border border-border bg-card p-4"
      >
        <h2 className="font-heading mb-3 text-sm font-extrabold">
          Status Meja
        </h2>
        <div className="flex flex-wrap gap-2">
          {tables.map((t) => (
            <div
              key={t.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                t.status === "OCCUPIED" && "border-status-occupied/40",
                t.status === "AVAILABLE" && "border-status-available/40",
                t.status === "WAITING_PAYMENT" && "border-status-waiting/40"
              )}
            >
              <span className="font-heading font-extrabold">{t.code}</span>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      </section>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden />
        Data diperbarui real-time dari mock store.
      </p>
    </div>
  );
}
