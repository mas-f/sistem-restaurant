"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { TimeLabel } from "@/components/time-label";
import { Button } from "@/components/ui/button";
import { branches, restaurant } from "@/lib/mock-data";
import { rupiah } from "@/lib/format";
import type { ReceiptView } from "@/lib/types";

const methodLabel = {
  QRIS: "QRIS",
  CASH: "Tunai",
} as const;

export function ReceiptScreen({ receipt }: { receipt: ReceiptView }) {
  const branch = branches[0];

  return (
    <div className="min-h-dvh bg-muted/40 px-4 py-8 print:bg-white print:p-0">
      <style>{`
        @page { size: 80mm auto; margin: 4mm; }
        @media print {
          body { background: #fff; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-[80mm]">
        <div className="mb-4 flex gap-2 print:hidden">
          <Button
            onClick={() => window.print()}
            className="h-10 flex-1 gap-2 rounded-full text-sm font-bold cursor-pointer"
          >
            <Printer className="size-4" aria-hidden />
            Cetak / Simpan PDF
          </Button>
          <Link
            href="/staff/cashier"
            className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-bold hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Kembali
          </Link>
        </div>

        <article className="rounded-xl border border-border bg-white p-5 font-mono text-[11px] leading-relaxed text-black shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <header className="border-b border-dashed border-black/40 pb-3 text-center">
            <p className="font-heading text-base font-extrabold tracking-tight">
              {restaurant.name}
            </p>
            {branch && (
              <p className="mt-1 text-[10px] leading-snug">{branch.address}</p>
            )}
            <p className="mt-2 text-[10px] font-bold tracking-[0.18em] uppercase">
              Kwitansi Pembayaran
            </p>
          </header>

          <dl className="space-y-1 border-b border-dashed border-black/40 py-3">
            <div className="flex justify-between gap-3">
              <dt className="text-black/60">No. Kwitansi</dt>
              <dd className="tnum text-right font-bold">
                {receipt.paymentCode}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-black/60">Meja</dt>
              <dd className="font-bold">{receipt.tableCode}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-black/60">Tanggal</dt>
              <dd className="tnum text-right">
                <TimeLabel iso={receipt.paidAt} variant="date" /> ·{" "}
                <TimeLabel iso={receipt.paidAt} />
              </dd>
            </div>
          </dl>

          <section className="border-b border-dashed border-black/40 py-3">
            {receipt.orders.length === 0 ? (
              <p className="py-2 text-center text-black/60">
                Detail order tidak tersedia.
              </p>
            ) : (
              <div className="space-y-3">
                {receipt.orders.map((order) => (
                  <div key={order.code}>
                    <div className="flex justify-between gap-2 text-[10px] font-bold text-black/60">
                      <span>{order.code}</span>
                      <TimeLabel iso={order.createdAt} />
                    </div>
                    <ul className="mt-1 space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="min-w-0">
                              <span className="tnum font-bold">
                                {item.quantity}x
                              </span>{" "}
                              {item.productName}
                            </span>
                            <span className="tnum shrink-0 font-semibold">
                              {rupiah(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                          {item.note && (
                            <p className="pl-5 text-[10px] text-black/55">
                              Catatan: {item.note}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <dl className="space-y-1 border-b border-dashed border-black/40 py-3">
            <div className="flex justify-between gap-3 text-sm">
              <dt className="font-bold">Total</dt>
              <dd className="tnum font-extrabold">{rupiah(receipt.amount)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-black/60">Metode</dt>
              <dd className="font-bold">{methodLabel[receipt.method]}</dd>
            </div>
            {receipt.method === "CASH" && receipt.amountReceived !== null && (
              <>
                <div className="flex justify-between gap-3">
                  <dt className="text-black/60">Uang diterima</dt>
                  <dd className="tnum">{rupiah(receipt.amountReceived)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-black/60">Kembalian</dt>
                  <dd className="tnum">
                    {rupiah(receipt.change ?? 0)}
                  </dd>
                </div>
              </>
            )}
          </dl>

          <footer className="pt-3 text-center">
            <p className="text-[10px] font-bold">
              Terima kasih atas kunjungan Anda
            </p>
            <p className="mt-1 text-[9px] text-black/55">
              Simpan kwitansi ini sebagai bukti pembayaran.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
