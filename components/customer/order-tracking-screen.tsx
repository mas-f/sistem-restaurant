"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  PackageCheck,
  QrCode,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { rupiah } from "@/lib/format";
import { BrandLogo } from "@/components/brand-logo";
import { ProductImage } from "@/components/customer/product-image";
import type { Order, TrackingStep } from "@/lib/types";
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
  order,
  tableToken,
}: {
  order: Order | null;
  tableToken: string;
}) {
  const [now, setNow] = useState(0);
  const menuHref = tableToken
    ? `/order/table/${encodeURIComponent(tableToken)}`
    : "/";

  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

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
          href={menuHref}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          Kembali ke Menu
        </Link>
      </div>
    );
  }

  const completed = order.status === "COMPLETED";
  const currentIdx = completed
    ? steps.length
    : stepIndex[
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

  const total =
    order.total ??
    order.items.reduce(
      (sum, item) => sum + (item.unitPrice + item.modifierDelta) * item.quantity,
      0
    );

  const cancelled = order.status === "CANCELLED";

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
        {cancelled ? (
          <p className="rounded-xl border border-status-error/30 bg-status-error-bg px-4 py-3 text-sm font-semibold text-status-error-fg">
            Pesanan ini dibatalkan. Hubungi staf bila perlu bantuan.
          </p>
        ) : (
          <ol aria-label="Status pesanan" className="relative space-y-0">
            {steps.map((step, i) => {
              const done = i < currentIdx;
              const active = !completed && i === currentIdx;
              const Icon = step.icon;
              return (
                <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-9 left-4.25 h-[calc(100%-2rem)] w-0.5",
                        done ? "bg-status-available" : "bg-border"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition",
                      done &&
                      "border-status-available bg-status-available text-white",
                      active &&
                      "border-primary bg-primary text-primary-foreground shadow-[0_0_0_5px_rgba(234,88,12,0.18)]",
                      !done &&
                      !active &&
                      "border-border bg-card text-muted-foreground"
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
                      {step.label}
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
        )}

        {/* Item list */}
        <section
          aria-label="Rincian pesanan"
          className="mt-8 rounded-xl border border-border bg-card p-4"
        >
          <h2 className="font-heading text-sm font-bold">Rincian Pesanan</h2>
          <ul className="mt-3 divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start gap-3 py-2.5">
                <div className="relative size-11 shrink-0">
                  <div className="size-full overflow-hidden rounded-lg bg-muted">
                    <ProductImage
                      src={item.imageUrl ?? ""}
                      alt=""
                      sizes="44px"
                    />
                  </div>
                  <span className="tnum absolute -right-1.5 -bottom-1.5 flex size-5 items-center justify-center rounded-full border border-border bg-card text-[10px] font-extrabold">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{item.productName}</p>
                  {item.modifierNames.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {item.modifierNames.join(" · ")}
                    </p>
                  )}
                  {item.note ? (
                    <p className="text-xs text-primary italic">“{item.note}”</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Tanpa catatan
                    </p>
                  )}
                </div>
                <span className="tnum text-sm font-semibold">
                  {rupiah((item.unitPrice + item.modifierDelta) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm">
            <span className="font-bold">Total</span>
            <span className="tnum font-extrabold text-primary">
              {rupiah(total)}
            </span>
          </div>
        </section>

        {/* Panduan pembayaran */}
        {!cancelled &&
          (order.paid ? (
            <section
              aria-label="Informasi pembayaran"
              className="mt-6 flex items-start gap-3 rounded-xl border border-status-available/30 bg-status-available-bg px-4 py-3"
            >
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-status-available-fg"
                aria-hidden
              />
              <div>
                <p className="text-sm font-bold text-status-available-fg">
                  Pembayaran selesai
                </p>
                <p className="mt-0.5 text-xs text-status-available-fg/80">
                  Terima kasih atas kunjungan anda.
                </p>
              </div>
            </section>
          ) : (
            <section
              aria-label="Informasi pembayaran"
              className="mt-6 rounded-xl border border-border bg-card p-4"
            >
              <h2 className="flex items-center gap-2 font-heading text-sm font-bold">
                <Wallet
                  className="size-4 text-status-waiting-fg"
                  aria-hidden
                />
                Bayar di kasir
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pembayaran dilakukan langsung di kasir.
              </p>
              <ol className="mt-3 space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="tnum flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-extrabold text-accent-foreground">
                    1
                  </span>
                  <span>Selesai makan? Datangi kasir atau panggil waiter.</span>
                </li>
                <li className="flex gap-2">
                  <span className="tnum flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-extrabold text-accent-foreground">
                    2
                  </span>
                  <span>
                    Sebutkan{" "}
                    <strong className="font-bold">Meja {order.tableCode}</strong>{" "}.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="tnum flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-extrabold text-accent-foreground">
                    3
                  </span>
                  <span>Bayar dengan tunai atau QRIS.</span>
                </li>
              </ol>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-semibold">
                  <Banknote className="size-3.5" aria-hidden /> Tunai
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-semibold">
                  <QrCode className="size-3.5" aria-hidden /> QRIS
                </span>
              </div>
            </section>
          ))}
      </main>

      {/* Bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-lg">
          <Link
            href={menuHref}
            className="flex h-12 items-center justify-center rounded-full border border-border px-5 text-sm font-bold hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Pesan Lagi
          </Link>
        </div>
      </div>
    </div>
  );
}
