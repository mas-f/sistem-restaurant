"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  Search,
  Timer,
  Users,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { BrandLogo } from "@/components/brand-logo";
import { SignOutButton } from "@/components/sign-out-button";
import { rupiah, restaurant } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { KitchenStatus, Order } from "@/lib/types";
import { cn } from "@/lib/utils";

const columns: {
  key: KitchenStatus;
  title: string;
  icon: typeof Flame;
  accent: string;
}[] = [
  { key: "NEW", title: "Baru", icon: BellRing, accent: "text-status-waiting-fg" },
  { key: "ACCEPTED", title: "Diterima", icon: CheckCircle2, accent: "text-accent-foreground" },
  { key: "PREPARING", title: "Memasak", icon: Flame, accent: "text-status-preparing-fg" },
  { key: "READY", title: "Siap", icon: ChefHat, accent: "text-status-ready-fg" },
];

const stations = ["Semua Stasiun", "Wok", "Grill", "Bar"];

function elapsed(iso: string, now: number): string {
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function OrderCard({
  order,
  now,
  onAdvance,
}: {
  order: Order;
  now: number;
  onAdvance: (id: string) => void;
}) {
  const mins = Math.floor((now - new Date(order.createdAt).getTime()) / 60000);
  const urgent = mins >= 12;

  const nextLabel: Record<KitchenStatus, string> = {
    NEW: "Terima",
    ACCEPTED: "Mulai Masak",
    PREPARING: "Tandai Siap",
    READY: "Selesai",
  };

  return (
    <article
      className={cn(
        "animate-rise overflow-hidden rounded-xl border bg-card",
        "shadow-[0_2px_4px_-1px_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)]",
        urgent && order.kitchenStatus !== "READY"
          ? "border-status-waiting/60"
          : "border-border"
      )}
    >
      <header
        className={cn(
          "flex items-center gap-2 px-3 py-2.5",
          urgent && order.kitchenStatus !== "READY"
            ? "bg-status-waiting-bg"
            : "bg-secondary"
        )}
      >
        <span className="tnum font-heading text-sm font-extrabold">
          {order.tableCode}
        </span>
        <span className="truncate text-[11px] text-muted-foreground">
          {order.code}
        </span>
        <span
          className={cn(
            "tnum ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
            urgent && order.kitchenStatus !== "READY"
              ? "bg-status-error text-white"
              : "bg-card text-foreground"
          )}
        >
          <Timer className="size-3" aria-hidden />
          {elapsed(order.createdAt, now)}
        </span>
      </header>

      <ul className="divide-y divide-border px-3">
        {order.items.map((it) => (
          <li key={it.id} className="flex items-start gap-2 py-2.5">
            <span className="tnum flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-extrabold text-primary">
              {it.quantity}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug font-semibold">
                {it.productName}
              </p>
              {it.modifierNames.length > 0 && (
                <p className="text-xs font-medium text-primary">
                  {it.modifierNames.join(", ")}
                </p>
              )}
              {it.note && (
                <p className="mt-0.5 text-xs text-status-error-fg">
                  Catatan: {it.note}
                </p>
              )}
              <span className="mt-1 inline-block rounded bg-secondary px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground uppercase">
                {it.station}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {order.note && (
        <p className="mx-3 mb-2 rounded-lg bg-accent/60 px-2.5 py-1.5 text-xs font-medium text-accent-foreground">
          Catatan meja: {order.note}
        </p>
      )}

      <div className="px-3 pb-3">
        <button
          onClick={() => onAdvance(order.id)}
          className={cn(
            "flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold transition",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:translate-y-px",
            order.kitchenStatus === "READY"
              ? "bg-status-available text-white hover:bg-status-available/90"
              : order.kitchenStatus === "PREPARING"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-foreground hover:bg-accent"
          )}
        >
          {order.kitchenStatus === "READY" ? (
            <CheckCircle2 className="size-4" aria-hidden />
          ) : order.kitchenStatus === "PREPARING" ? (
            <ChefHat className="size-4" aria-hidden />
          ) : (
            <Flame className="size-4" aria-hidden />
          )}
          {nextLabel[order.kitchenStatus]}
        </button>
      </div>
    </article>
  );
}

export function KitchenScreen() {
  const { orders, advanceKitchen, toast } = useStore();
  const [station, setStation] = useState(stations[0]);
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const active = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (o.status === "COMPLETED" || o.status === "CANCELLED") return false;
      if (station !== "Semua Stasiun") {
        if (!o.items.some((i) => i.station === station)) return false;
      }
      if (q) {
        const hay = `${o.code} ${o.tableCode} ${o.items
          .map((i) => i.productName)
          .join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, station, query]);

  const counts = {
    NEW: active.filter((o) => o.kitchenStatus === "NEW").length,
    ACCEPTED: active.filter((o) => o.kitchenStatus === "ACCEPTED").length,
    PREPARING: active.filter((o) => o.kitchenStatus === "PREPARING").length,
    READY: active.filter((o) => o.kitchenStatus === "READY").length,
  };

  const handleAdvance = (id: string) => {
    const o = orders.find((x) => x.id === id);
    advanceKitchen(id);
    if (o && o.kitchenStatus === "PREPARING") {
      toast({
        title: `Pesanan meja ${o.tableCode} siap`,
        description: "Beri tahu waiter untuk menyajikan.",
        tone: "success",
      });
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="h-7 shrink-0" />
            <div>
              <h1 className="font-heading text-base leading-tight font-extrabold">
                Kitchen Display
              </h1>
              <p className="text-xs text-muted-foreground">
                {restaurant.name} · LIVE
              </p>
            </div>
          </div>

          <div className="relative ml-auto w-full sm:w-56">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari order / meja…"
              aria-label="Cari pesanan"
              className="h-9 w-full rounded-full border border-border bg-background pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 font-semibold text-status-preparing-fg">
              <Flame className="size-4" aria-hidden />
              <span className="tnum">{counts.PREPARING}</span> memasak
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-status-ready-fg">
              <CheckCircle2 className="size-4" aria-hidden />
              <span className="tnum">{counts.READY}</span> siap
            </span>
          </div>

          <SignOutButton />
        </div>

        {/* Station filter */}
        <div
          role="tablist"
          aria-label="Filter stasiun"
          className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2 lg:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {stations.map((s) => {
            const active2 = s === station;
            return (
              <button
                key={s}
                role="tab"
                aria-selected={active2}
                onClick={() => setStation(s)}
                className={cn(
                  "h-8 shrink-0 rounded-full border px-3.5 text-xs font-bold whitespace-nowrap transition",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active2
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-accent/50"
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </header>

      {/* 4 kolom status (PRD §8.1) */}
      <main className="grid gap-4 p-4 lg:grid-cols-4 lg:px-6">
        {columns.map((col) => {
          const list = active.filter((o) => o.kitchenStatus === col.key);
          const Icon = col.icon;
          return (
            <section
              key={col.key}
              aria-label={`Kolom ${col.title}`}
              className="flex min-w-0 flex-col rounded-xl border border-border bg-secondary/50 p-3"
            >
              <header className="mb-3 flex items-center gap-2">
                <Icon className={cn("size-4", col.accent)} aria-hidden />
                <h2 className="font-heading text-sm font-extrabold">
                  {col.title}
                </h2>
                <span
                  className={cn(
                    "tnum ml-auto rounded-full px-2 py-0.5 text-xs font-bold",
                    col.key === "READY"
                      ? "bg-status-available-bg text-status-available-fg"
                      : col.key === "NEW"
                        ? "bg-status-waiting-bg text-status-waiting-fg"
                        : "bg-accent text-accent-foreground"
                  )}
                >
                  {list.length}
                </span>
              </header>

              <div className="flex flex-1 flex-col gap-3">
                {list.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
                    <Clock className="size-5 text-muted-foreground" aria-hidden />
                    <p className="text-xs text-muted-foreground">
                      Tidak ada pesanan
                    </p>
                  </div>
                ) : (
                  list.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      now={now}
                      onAdvance={handleAdvance}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </main>

      {/* Stats strip */}
      <footer className="border-t border-border bg-card px-4 py-3 lg:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <BellRing className="size-4 text-status-waiting-fg" aria-hidden />
            Baru: <strong className="tnum text-foreground">{counts.NEW}</strong>
          </span>
          <span className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4 text-accent-foreground" aria-hidden />
            Diterima:{" "}
            <strong className="tnum text-foreground">{counts.ACCEPTED}</strong>
          </span>
          <span className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <StatusBadge status="PREPARING" /> status mengikuti kartu secara
            langsung
          </span>
          <span className="tnum hidden text-xs text-muted-foreground md:inline">
            Rata-rata rupiah order:{" "}
            {rupiah(
              active.length
                ? Math.round(
                    active.reduce(
                      (s, o) =>
                        s +
                        o.items.reduce(
                          (x, i) => x + (i.unitPrice + i.modifierDelta) * i.quantity,
                          0
                        ),
                      0
                    ) / active.length
                  )
                : 0
            )}
          </span>
        </div>
      </footer>
    </div>
  );
}
