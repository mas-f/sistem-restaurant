"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  PackageCheck,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { rupiah } from "@/lib/mock-data";
import { BrandLogo } from "@/components/brand-logo";
import { useStore } from "@/lib/store";
import type { TrackingStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const steps: { key: TrackingStep; label: string; icon: typeof Clock }[] = [
  { key: "ORDER_RECEIVED", label: "Pesanan Diterima", icon: ReceiptText },
  { key: "CONFIRMED", label: "Dikonfirmasi", icon: CheckCircle2 },
  { key: "PREPARING", label: "Sedang Dimasak", icon: Flame },
  { key: "READY", label: "Siap Disajikan", icon: ChefHat },
  { key: "COMPLETED", label: "Selesai", icon: PackageCheck },
];

const stepIndex: Record<TrackingStep, number> = {
  ORDER_RECEIVED: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  READY: 3,
  COMPLETED: 4,
};

export function OrderTrackingScreen({
  orderId,
  tableToken,
}: {
  orderId: string;
  tableToken: string;
}) {
  const { orders, sessions, tables, setBillStatus, billRequestedFor, toast } =
    useStore();
  const [billOpen, setBillOpen] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const order = orders.find(
    (o) => o.id === orderId || o.id === orderId.toLowerCase()
  );

  if (!order) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-status-error-bg">
          <ReceiptText className="size-7 text-status-error-fg" aria-hidden />
        </div>
        <h1 className="font-heading text-xl font-extrabold">
          Pesanan tidak ditemukan
        </h1>
        <p className="text-sm text-muted-foreground">
          Pesanan mungkin sudah dibatalkan atau nomornya salah.
        </p>
        <Link
          href={`/order/table/${encodeURIComponent(tableToken)}`}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  const currentIdx = stepIndex[
    (order.status === "PENDING"
      ? "ORDER_RECEIVED"
      : order.status === "CONFIRMED"
        ? "CONFIRMED"
        : order.status === "PREPARING"
          ? "PREPARING"
          : order.status === "READY"
            ? "READY"
            : "COMPLETED") as TrackingStep
  ];

  const elapsed = Math.max(
    0,
    Math.floor((now - new Date(order.createdAt).getTime()) / 1000)
  );
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const total = order.items.reduce(
    (s, i) => s + (i.unitPrice + i.modifierDelta) * i.quantity,
    0
  );

  const table = tables.find((t) => t.code === order.tableCode);
  const session = table && sessions.find((s) => s.tableId === table.id);
  const billRequested =
    (table && billRequestedFor === table.id) ||
    session?.billStatus === "REQUESTED";

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg pb-32">
      <header className="border-b border-border bg-card">
      <div className="px-4 py-5">
        <BrandLogo className="h-5" />
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <h1 className="font-heading text-xl font-extrabold">
              {order.code}
            </h1>
            <span className="tnum rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
              Meja {order.tableCode}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" aria-hidden />
            <span className="tnum">
              Berjalan {mm}:{ss}
            </span>
            <span aria-hidden>·</span>
            <span>Estimasi 15–20 menit</span>
          </div>
        </div>
      </header>

      <main className="px-4 pt-6">
        {/* Progress tracker */}
        <ol
          aria-label="Status pesanan"
          className="relative space-y-0"
        >
          {steps.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            const Icon = s.icon;
            return (
              <li key={s.key} className="relative flex gap-4 pb-8 last:pb-0">
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-9 left-[17px] h-[calc(100%-2rem)] w-0.5",
                      done ? "bg-status-available" : "bg-border"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition",
                    done && "border-status-available bg-status-available text-white",
                    active &&
                      "border-primary bg-primary text-primary-foreground shadow-[0_0_0_5px_rgba(234,88,12,0.18)]",
                    !done && !active && "border-border bg-card text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 pt-1">
                  <p
                    className={cn(
                      "text-sm font-bold",
                      !done && !active && "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </p>
                  {active && (
                    <p className="animate-rise mt-0.5 text-xs text-primary">
                      Sedang berlangsung…
                    </p>
                  )}
                </div>
                {active && (
                  <span className="tnum ml-auto pt-1 text-xs font-semibold text-muted-foreground">
                    {mm}:{ss}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {/* Item list */}
        <section
          aria-label="Rincian pesanan"
          className="mt-8 rounded-xl border border-border bg-card p-4"
        >
          <h2 className="font-heading text-sm font-bold">Rincian Pesanan</h2>
          <ul className="mt-3 divide-y divide-border">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-start gap-3 py-2.5">
                <span className="tnum flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-extrabold text-accent-foreground">
                  {it.quantity}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{it.productName}</p>
                  {it.modifierNames.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {it.modifierNames.join(" · ")}
                    </p>
                  )}
                  {it.note && (
                    <p className="text-xs text-primary italic">“{it.note}”</p>
                  )}
                </div>
                <span className="tnum text-sm font-semibold">
                  {rupiah((it.unitPrice + it.modifierDelta) * it.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-border pt-3 text-sm">
            <span className="font-bold">Total</span>
            <span className="tnum font-extrabold text-primary">
              {rupiah(total)}
            </span>
          </div>
        </section>
      </main>

      {/* Bottom bar: request bill */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg gap-3">
          <Link
            href={`/order/table/${encodeURIComponent(tableToken)}`}
            className="flex h-12 items-center rounded-full border border-border px-5 text-sm font-bold hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Pesan Lagi
          </Link>
          <Button
            onClick={() => setBillOpen(true)}
            disabled={billRequested}
            className={cn(
              "h-12 flex-1 rounded-full text-sm font-bold",
              billRequested &&
                "bg-status-waiting-bg text-status-waiting-fg hover:bg-status-waiting-bg"
            )}
          >
            {billRequested ? "Tagihan Diminta ✓" : "Minta Tagihan"}
          </Button>
        </div>
      </div>

      <Dialog open={billOpen} onOpenChange={setBillOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="font-heading text-lg font-extrabold">
            Minta tagihan sekarang?
          </DialogTitle>
          <DialogDescription>
            Kasir akan menyiapkan tagihan untuk meja {order.tableCode}.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBillOpen(false)}>
              Batal
            </Button>
            <Button
              className="font-bold"
              onClick={() => {
                if (table) setBillStatus(table.id, "REQUESTED");
                setBillOpen(false);
                toast({
                  title: "Permintaan tagihan terkirim",
                  description: "Mohon tunggu, kasir sedang menyiapkan.",
                  tone: "success",
                });
              }}
            >
              Minta Tagihan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
