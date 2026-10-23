"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Printer,
  ReceiptText,
  Search,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { SignOutButton } from "@/components/sign-out-button";
import { StatusBadge } from "@/components/status-badge";
import { TimeLabel } from "@/components/time-label";
import { Button, buttonVariants } from "@/components/ui/button";
import { rupiah } from "@/lib/format";
import type { PaymentMethod, PaymentView } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

const methodLabel: Record<PaymentMethod, string> = {
  QRIS: "QRIS",
  CASH: "Tunai",
};

const methodFilters: { key: "ALL" | PaymentMethod; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "QRIS", label: "QRIS" },
  { key: "CASH", label: "Tunai" },
];

const rangeFilters: { key: "ALL" | "TODAY" | "7DAYS"; label: string }[] = [
  { key: "ALL", label: "Semua waktu" },
  { key: "TODAY", label: "Hari ini" },
  { key: "7DAYS", label: "7 hari terakhir" },
];

function startOfLocalDay(daysAgo = 0): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

export function CashierPaymentsScreen({
  payments,
}: {
  payments: PaymentView[];
}) {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<"ALL" | PaymentMethod>("ALL");
  const [range, setRange] = useState<"ALL" | "TODAY" | "7DAYS">("ALL");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const minDate =
      range === "TODAY"
        ? startOfLocalDay()
        : range === "7DAYS"
          ? startOfLocalDay(6)
          : null;

    return payments.filter((payment) => {
      if (method !== "ALL" && payment.method !== method) return false;
      if (minDate && new Date(payment.paidAt) < minDate) return false;
      if (!q) return true;

      const haystack = [
        payment.code,
        payment.tableCode,
        payment.cashierName ?? "",
        ...payment.orderCodes,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [method, payments, query, range]);

  const paidPayments = filtered.filter(
    (payment) => payment.status === "PAID"
  );
  const total = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const rangeStart =
    filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const updateMethod = (value: "ALL" | PaymentMethod) => {
    setMethod(value);
    setPage(1);
  };

  const updateRange = (value: "ALL" | "TODAY" | "7DAYS") => {
    setRange(value);
    setPage(1);
  };

  const resetFilters = () => {
    setQuery("");
    setMethod("ALL");
    setRange("ALL");
    setPage(1);
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
          <Link
            href="/staff/cashier"
            aria-label="Kembali ke halaman kasir"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "rounded-full"
            )}
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>

          <div className="flex items-center gap-2.5">
            <BrandLogo className="h-7 shrink-0" />
            <div>
              <h1 className="font-heading text-base leading-tight font-extrabold">
                Riwayat Pembayaran
              </h1>
              <p className="text-xs text-muted-foreground">
                Data pembayaran dan cetak ulang kwitansi.
              </p>
            </div>
          </div>

          <div className="ml-auto">
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="space-y-5 p-4 lg:px-6">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs font-semibold text-muted-foreground">
              Total Diterima
            </p>
            <p className="tnum font-heading text-2xl font-extrabold text-primary">
              {rupiah(total)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-5 py-4">
            <p className="text-xs font-semibold text-muted-foreground">
              Jumlah Transaksi
            </p>
            <p className="tnum font-heading text-2xl font-extrabold">
              {paidPayments.length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-60 flex-1">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Cari kode pembayaran, order, meja, atau kasir…"
              aria-label="Cari pembayaran"
              className="h-10 w-full rounded-full border border-border bg-background pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            />
          </div>

          <div
            role="group"
            aria-label="Filter metode pembayaran"
            className="flex gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            {methodFilters.map((item) => {
              const active = item.key === method;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => updateMethod(item.key)}
                  className={cn(
                    "h-9 shrink-0 rounded-full border px-3.5 text-xs font-bold whitespace-nowrap transition",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-accent/50"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <select
            value={range}
            onChange={(event) =>
              updateRange(event.target.value as "ALL" | "TODAY" | "7DAYS")
            }
            aria-label="Filter waktu pembayaran"
            className="h-9 rounded-full border border-border bg-card px-3 text-xs font-bold focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            {rangeFilters.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>

          {(query || method !== "ALL" || range !== "ALL") && (
            <button
              type="button"
              onClick={resetFilters}
              className="h-9 shrink-0 rounded-full px-3 text-xs font-bold text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Reset
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <ReceiptText
              className="size-8 text-muted-foreground"
              aria-hidden
            />
            <p className="font-heading font-bold">Tidak ada pembayaran</p>
            <p className="text-sm text-muted-foreground">
              Coba ubah kata kunci atau filter pembayaran.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-235 text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/60 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    <th className="px-4 py-2.5">Kode</th>
                    <th className="px-4 py-2.5">Order</th>
                    <th className="px-4 py-2.5">Meja</th>
                    <th className="px-4 py-2.5">Metode</th>
                    <th className="px-4 py-2.5 text-right">Jumlah</th>
                    <th className="px-4 py-2.5">Kasir</th>
                    <th className="px-4 py-2.5">Waktu</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((payment) => (
                    <tr key={payment.id} className="hover:bg-secondary/40">
                      <td className="tnum px-4 py-3 font-semibold">
                        <span className="flex items-center gap-2">
                          <ReceiptText
                            className="size-3.5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                          {payment.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span
                          className="tnum block max-w-55 truncate"
                          title={payment.orderCodes.join(", ")}
                        >
                          {payment.orderCodes.length > 0
                            ? payment.orderCodes.join(", ")
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {payment.tableCode}
                      </td>
                      <td className="px-4 py-3">
                        {methodLabel[payment.method]}
                      </td>
                      <td className="tnum px-4 py-3 text-right font-bold">
                        {rupiah(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {payment.cashierName ?? "—"}
                      </td>
                      <td className="tnum px-4 py-3 text-muted-foreground">
                        <span className="whitespace-nowrap">
                          <TimeLabel iso={payment.paidAt} variant="date" />{" "}
                          <TimeLabel iso={payment.paidAt} />
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/staff/cashier/receipt/${encodeURIComponent(payment.code)}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Cetak kwitansi ${payment.code}`}
                          className={cn(
                            buttonVariants({
                              variant: "outline",
                              size: "sm",
                            }),
                            "gap-1.5 rounded-full"
                          )}
                        >
                          <Printer className="size-3.5" aria-hidden />
                          Cetak
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Menampilkan{" "}
                <span className="tnum font-semibold text-foreground">
                  {rangeStart}–{rangeEnd}
                </span>{" "}
                dari{" "}
                <span className="tnum font-semibold text-foreground">
                  {filtered.length}
                </span>{" "}
                pembayaran
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="gap-1 rounded-full"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  Sebelumnya
                </Button>
                <span className="tnum text-xs font-bold whitespace-nowrap">
                  Halaman {currentPage} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1 rounded-full"
                >
                  Berikutnya
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
