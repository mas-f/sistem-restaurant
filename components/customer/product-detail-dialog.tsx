"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { ProductImage } from "@/components/customer/product-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { rupiah } from "@/lib/format";
import type { MenuProduct } from "@/lib/types";

export function ProductDetailDialog({
  product,
  onOpenChange,
  onAdd,
}: {
  product: MenuProduct | null;
  onOpenChange: (open: boolean) => void;
  onAdd: (p: MenuProduct, qty: number, note: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  if (!product) return null;

  const handleOpen = (open: boolean) => {
    if (!open) {
      setQty(1);
      setNote("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={!!product} onOpenChange={handleOpen}>
      <DialogContent className="top-[50%] max-h-[90dvh] w-[calc(100vw-2rem)] max-w-lg gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-lg">
        <div className="relative h-40 w-full overflow-hidden bg-linear-to-br from-secondary to-accent/50">
          <ProductImage
            src={product.imageUrl}
            alt={product.name}
            sizes="(max-width: 640px) 100vw, 512px"
          />
        </div>

        <div className="space-y-5 p-5">
          <div>
            <DialogTitle className="font-heading text-xl font-extrabold">
              {product.name}
            </DialogTitle>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>
            <p className="tnum mt-2 text-lg font-extrabold text-primary">
              {rupiah(product.price)}
            </p>
          </div>

          <div>
            <label htmlFor="note" className="mb-2 block text-sm font-bold">
              Catatan
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Contoh: jangan terlalu pedas, tanpa bawang…"
              className="w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            />
          </div>

          <div className="sticky bottom-0 -mx-5 flex items-center gap-3 border-t border-border bg-card px-5 py-4">
            <div className="flex items-center gap-1 rounded-full border border-border bg-background p-1">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Kurangi jumlah"
                className="flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <span className="tnum w-8 text-center text-sm font-extrabold">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                aria-label="Tambah jumlah"
                className="flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
            <Button
              className="h-11 flex-1 rounded-full text-sm font-bold cursor-pointer"
              onClick={() => {
                onAdd(product, qty, note);
                handleOpen(false);
              }}
            >
              Tambah · {rupiah(product.price * qty)}
            </Button>
          </div>
        </div>
        <DialogDescription className="sr-only">
          Detail produk {product.name}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
