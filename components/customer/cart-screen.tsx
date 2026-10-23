"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { rupiah } from "@/lib/format";
import { BrandLogo } from "@/components/brand-logo";
import { useStore } from "@/lib/store";
import { createOrderAction } from "@/lib/action";

export function CartScreen({
  tableCode,
  tableToken,
}: {
  tableCode: string;
  tableToken: string;
}) {
  const router = useRouter();
  const { cart, updateQty, removeItem, clearCart, toast } = useStore();
  const [confirm, setConfirm] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderPending, startOrder] = useTransition();

  const subtotal = cart.reduce(
    (s, i) => s + (i.unitPrice + i.modifierDelta) * i.quantity,
    0
  );
  const total = subtotal;

  const handlePlaceOrder = () => {
    setOrderError(null);
    startOrder(async () => {
      const result = await createOrderAction({
        tableToken,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          note: item.note,
        })),
      });

      if (result.error || !result.code) {
        setOrderError(result.error ?? "Gagal membuat pesanan. Coba lagi.");
        return;
      }

      clearCart();
      setConfirm(false);
      toast({
        title: "Pesanan terkirim ke dapur",
        description: "Kamu bisa memantau statusnya secara real-time.",
        tone: "success",
      });
      router.push(
        `/order/success?id=${encodeURIComponent(result.code)}&token=${encodeURIComponent(tableToken)}`
      );
    });
  };

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
                        className="flex size-8 items-center justify-center rounded-full hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
                      >
                        <Minus className="size-3.5" aria-hidden />
                      </button>
                      <span className="tnum w-6 text-center text-sm font-bold">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(it.id, it.quantity + 1)}
                        aria-label={`Tambah ${it.productName}`}
                        className="flex size-8 items-center justify-center rounded-full hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
                      >
                        <Plus className="size-3.5" aria-hidden />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(it.id)}
                      aria-label={`Hapus ${it.productName}`}
                      className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-status-error-bg hover:text-status-error-fg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none  cursor-pointer"
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
                <div className="flex justify-between text-base">
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
              onClick={() => {
                setOrderError(null);
                setConfirm(true);
              }}
              disabled={orderPending}
              className="h-12 rounded-full px-6 text-sm font-bold cursor-pointer"
            >
              {orderPending ? "Mengirim…" : "Pesan Sekarang"}
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
          {orderError && (
            <p
              role="alert"
              className="rounded-lg bg-status-error-bg px-3 py-2 text-xs font-medium text-status-error-fg"
            >
              {orderError}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)} className="cursor-pointer">
              Batal
            </Button>
            <Button
              onClick={handlePlaceOrder}
              disabled={orderPending}
              className="font-bold cursor-pointer"
            >
              {orderPending ? "Mengirim…" : "Ya, Pesan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
