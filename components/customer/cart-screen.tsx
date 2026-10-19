"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBasket,
  Trash2,
  BellRing,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { rupiah, restaurant } from "@/lib/mock-data";
import { BrandLogo } from "@/components/brand-logo";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SERVICE_PCT = 0.05;
const TAX_PCT = 0.10;

export function CartScreen({
  tableCode,
  tableToken,
}: {
  tableCode: string;
  tableToken: string;
}) {
  const {
    cart,
    updateQty,
    removeItem,
    placeOrder,
    setBillStatus,
    billRequestedFor,
    tables,
    toast,
  } = useStore();
  const [confirm, setConfirm] = useState(false);
  const [billDialog, setBillDialog] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);

  const subtotal = cart.reduce(
    (s, i) => s + (i.unitPrice + i.modifierDelta) * i.quantity,
    0
  );
  const service = Math.round(subtotal * SERVICE_PCT);
  const tax = Math.round(subtotal * TAX_PCT);
  const total = subtotal + service + tax;

  const table = tables.find((t) => t.code === tableCode);
  const billStatus = billRequestedFor === table?.id ? "REQUESTED" : null;

  const handlePlaceOrder = () => {
    const id = placeOrder(tableToken, tableCode);
    setConfirm(false);
    setSuccessId(id);
    toast({
      title: "Pesanan terkirim ke dapur",
      description: "Kamu bisa memantau statusnya secara real-time.",
      tone: "success",
    });
  };

  if (successId) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="animate-rise flex size-20 items-center justify-center rounded-full bg-status-available-bg">
          <CheckCircle2 className="size-10 text-status-available-fg" aria-hidden />
        </div>
        <div className="animate-rise stagger-1 space-y-2">
          <h1 className="font-heading text-2xl font-extrabold">
            Pesanan terkirim!
          </h1>
          <p className="text-sm text-muted-foreground">
            Dapur sudah menerima pesananmu. Estimasi 15–20 menit.
          </p>
        </div>
        <div className="animate-rise stagger-2 w-full rounded-xl border border-border bg-card p-4 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Meja</span>
            <span className="font-bold">{tableCode}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Nomor pesanan</span>
            <span className="tnum font-bold">{successId.toUpperCase()}</span>
          </div>
        </div>
        <div className="animate-rise stagger-3 flex w-full flex-col gap-2">
          <Link href={`/order/${encodeURIComponent(successId)}`} className="w-full">
            <Button className="h-12 w-full rounded-full text-sm font-bold">
              Lacak Pesanan
            </Button>
          </Link>
          <Link
            href={`/order/table/${encodeURIComponent(tableToken)}`}
            className="w-full"
          >
            <Button variant="outline" className="h-12 w-full rounded-full text-sm font-bold">
              Pesan Lagi
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg pb-40">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href={`/order/table/${encodeURIComponent(tableToken)}`}
            aria-label="Kembali ke menu"
            className="flex size-9 items-center justify-center rounded-full border border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <div>
            <h1 className="font-heading text-lg leading-tight font-extrabold">
              Keranjang
            </h1>
          <p className="tnum text-xs text-muted-foreground">Meja {tableCode}</p>
        </div>
        <BrandLogo className="ml-auto h-5 shrink-0" />
      </div>
      </header>

      <main className="px-4 pt-5">
        {cart.length === 0 ? (
          <div className="animate-rise flex flex-col items-center gap-3 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBasket className="size-7 text-muted-foreground" aria-hidden />
            </div>
            <p className="font-heading font-bold">Keranjang kosong</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Pilih menu favoritmu dulu, pesanan akan muncul di sini.
            </p>
            <Link
              href={`/order/table/${encodeURIComponent(tableToken)}`}
              className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Lihat Menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {cart.map((it, idx) => (
                <li
                  key={it.id}
                  className="animate-rise rounded-xl border border-border bg-card p-3 shadow-xs"
                  style={{ animationDelay: `${Math.min(idx, 5) * 60}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm font-bold">
                        {it.productName}
                      </p>
                      {it.modifierNames.length > 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {it.modifierNames.join(" · ")}
                        </p>
                      )}
                      {it.note && (
                        <p className="mt-0.5 text-xs text-primary italic">
                          “{it.note}”
                        </p>
                      )}
                      <p className="tnum mt-1 text-sm font-extrabold text-primary">
                        {rupiah((it.unitPrice + it.modifierDelta) * it.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-border bg-background">
                      <button
                        onClick={() => updateQty(it.id, it.quantity - 1)}
                        aria-label={`Kurangi ${it.productName}`}
                        className="flex size-8 items-center justify-center rounded-full hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        <Minus className="size-3.5" aria-hidden />
                      </button>
                      <span className="tnum w-6 text-center text-sm font-bold">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(it.id, it.quantity + 1)}
                        aria-label={`Tambah ${it.productName}`}
                        className="flex size-8 items-center justify-center rounded-full hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        <Plus className="size-3.5" aria-hidden />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(it.id)}
                      aria-label={`Hapus ${it.productName}`}
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-status-error-bg hover:text-status-error-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Ringkasan */}
            <section
              aria-label="Ringkasan biaya"
              className="mt-5 rounded-xl border border-border bg-card p-4"
            >
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tnum font-semibold">{rupiah(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Service (5%)</dt>
                  <dd className="tnum font-semibold">{rupiah(service)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pajak (10%)</dt>
                  <dd className="tnum font-semibold">{rupiah(tax)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <dt className="font-bold">Total</dt>
                  <dd className="tnum font-extrabold text-primary">
                    {rupiah(total)}
                  </dd>
                </div>
              </dl>
            </section>
          </>
        )}
      </main>

      {/* Bottom action bar */}
      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Total bayar</p>
              <p className="tnum font-heading text-lg font-extrabold">
                {rupiah(total)}
              </p>
            </div>
            <Button
              onClick={() => setConfirm(true)}
              className="h-12 rounded-full px-6 text-sm font-bold"
            >
              Pesan Sekarang
            </Button>
          </div>
        </div>
      )}

      {/* Konfirmasi pesan */}
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="font-heading text-lg font-extrabold">
            Kirim pesanan ke dapur?
          </DialogTitle>
          <DialogDescription>
            {cart.length} item untuk meja {tableCode}. Setelah dikirim, statusnya
            bisa dilacak di halaman tracking.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Batal
            </Button>
            <Button onClick={handlePlaceOrder} className="font-bold">
              Ya, Pesan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Bill */}
      <div className="mt-6 px-4">
        <button
          onClick={() => setBillDialog(true)}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-full border text-sm font-bold transition",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            billStatus
              ? "border-status-waiting/40 bg-status-waiting-bg text-status-waiting-fg"
              : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
          )}
        >
          <BellRing className="size-4" aria-hidden />
          {billStatus ? "Tagihan Diminta" : "Minta Tagihan"}
        </button>
      </div>

      <Dialog open={billDialog} onOpenChange={setBillDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogTitle className="font-heading text-lg font-extrabold">
            {billStatus
              ? "Tagihan sudah diminta"
              : "Minta tagihan sekarang?"}
          </DialogTitle>
          <DialogDescription>
            {billStatus
              ? "Kasir sedang menyiapkan tagihanmu. Mohon tunggu sebentar."
              : "Kasir akan menyiapkan tagihan untuk meja ini."}
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBillDialog(false)}>
              Batal
            </Button>
            {!billStatus && (
              <Button
                className="font-bold"
                onClick={() => {
                  if (table) setBillStatus(table.id, "REQUESTED");
                  setBillDialog(false);
                  toast({
                    title: "Permintaan tagihan terkirim",
                    description: "Tunggu konfirmasi kasir.",
                    tone: "success",
                  });
                }}
              >
                Minta Tagihan
              </Button>
            )}
          </DialogFooter>
          <p className="tnum text-center text-xs text-muted-foreground">
            {restaurant.name} · Meja {tableCode}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
