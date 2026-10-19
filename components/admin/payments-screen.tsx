"use client";

import { ReceiptText } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { TimeLabel } from "@/components/time-label";
import { rupiah } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { PaymentMethod } from "@/lib/types";

const label: Record<PaymentMethod, string> = {
  QRIS: "QRIS",
  CASH: "Tunai",
  DEBIT: "Debit",
  CREDIT: "Kredit",
  EWALLET: "E-Wallet",
};

export function PaymentsScreen() {
  const { payments } = useStore();
  const total = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Riwayat pembayaran hari ini.
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
            {payments.length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2.5">Kode</th>
              <th className="px-4 py-2.5">Order</th>
              <th className="px-4 py-2.5">Meja</th>
              <th className="px-4 py-2.5">Metode</th>
              <th className="px-4 py-2.5 text-right">Jumlah</th>
              <th className="px-4 py-2.5">Waktu</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p) => (
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
                  {p.orderId.toUpperCase()}
                </td>
                <td className="px-4 py-3 font-bold">{p.tableCode}</td>
                <td className="px-4 py-3">{label[p.method]}</td>
                <td className="tnum px-4 py-3 text-right font-bold">
                  {rupiah(p.amount)}
                </td>
                <td className="tnum px-4 py-3 text-muted-foreground">
                  <TimeLabel iso={p.paidAt} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status="PAID" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
