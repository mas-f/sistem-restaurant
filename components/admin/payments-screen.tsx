"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ReceiptText,
  Search,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { TimeLabel } from "@/components/time-label";
import { Button } from "@/components/ui/button";
import { rupiah } from "@/lib/format";
import type { PaymentMethod, PaymentView } from "@/lib/types";

const PAGE_SIZE = 10;

const label: Record<PaymentMethod, string> = {
  QRIS: "QRIS",
  CASH: "Tunai",
};

export function PaymentsScreen({ payments }: { payments: PaymentView[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return payments;

    return payments.filter((payment) => {
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
  }, [payments, query]);

  const total = filtered.reduce((sum, payment) => sum + payment.amount, 0);

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

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Riwayat pembayaran terbaru dari database.
        </p>
      </div>

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
            {filtered.length}
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
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

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    Tidak ada pembayaran yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                pageItems.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/40">
                    <td className="tnum px-4 py-3 font-semibold">
                      <span className="flex items-center gap-2">
                        <ReceiptText
                          className="size-3.5 text-muted-foreground"
                          aria-hidden
                        />
                        {p.code}
                      </span>
                    </td>
                    <td className="tnum px-4 py-3 text-muted-foreground">
                      <span
                        className="block max-w-[220px] truncate"
                        title={p.orderCodes.join(", ")}
                      >
                        {p.orderCodes.length > 0
                          ? p.orderCodes.join(", ")
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold">{p.tableCode}</td>
                    <td className="px-4 py-3">{label[p.method]}</td>
                    <td className="tnum px-4 py-3 text-right font-bold">
                      {rupiah(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.cashierName ?? "—"}
                    </td>
                    <td className="tnum px-4 py-3 text-muted-foreground">
                      <span className="whitespace-nowrap">
                        <TimeLabel iso={p.paidAt} variant="date" />{" "}
                        <TimeLabel iso={p.paidAt} />
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
