"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { modifierGroups, rupiah } from "@/lib/mock-data";
import type { Modifier, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductDetailDialog({
  product,
  onOpenChange,
  onAdd,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onAdd: (p: Product, mods: Modifier[], qty: number, note: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState<Record<string, string[]>>({});
  const [note, setNote] = useState("");

  const groups = useMemo(
    () =>
      (product?.modifierGroupIds ?? [])
        .map((id) => modifierGroups.find((g) => g.id === id))
        .filter(Boolean),
    [product]
  );

  if (!product) return null;

  const selectedMods: Modifier[] = groups.flatMap((g) =>
    (picked[g!.id] ?? []).flatMap((oid) =>
      g!.options.find((o) => o.id === oid) ? [g!.options.find((o) => o.id === oid)!] : []
    )
  );

  const missingRequired = groups.some(
    (g) => g!.required && (picked[g!.id] ?? []).length === 0
  );

  const unitPrice =
    product.price + selectedMods.reduce((s, m) => s + m.priceDelta, 0);

  const toggle = (groupId: string, optId: string, single: boolean) => {
    setPicked((prev) => {
      const cur = prev[groupId] ?? [];
      if (single) return { ...prev, [groupId]: cur[0] === optId ? [] : [optId] };
      return {
        ...prev,
        [groupId]: cur.includes(optId)
          ? cur.filter((x) => x !== optId)
          : [...cur, optId],
      };
    });
  };

  const handleOpen = (open: boolean) => {
    if (!open) {
      setQty(1);
      setPicked({});
      setNote("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={!!product} onOpenChange={handleOpen}>
      <DialogContent className="top-[50%] max-h-[90dvh] w-[calc(100vw-2rem)] max-w-lg gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-lg">
        <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-secondary to-accent/50">
          <span className="text-7xl drop-shadow-md" aria-hidden>
            {product.imageEmoji}
          </span>
          <div className="absolute top-3 left-3 flex gap-2">
            {product.popular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-status-waiting-bg px-2 py-1 text-[11px] font-bold text-status-waiting-fg">
                <Star className="size-3 fill-current" aria-hidden />
                Favorit
              </span>
            )}
            {!product.available && (
              <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-bold text-muted-foreground">
                Habis
              </span>
            )}
          </div>
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

          {groups.map((g) => {
            const group = g!;
            const sel = picked[group.id] ?? [];
            return (
              <fieldset key={group.id}>
                <legend className="mb-2 flex w-full items-center justify-between text-sm font-bold">
                  <span>{group.name}</span>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      group.required && sel.length === 0
                        ? "text-status-waiting-fg"
                        : "text-muted-foreground"
                    )}
                  >
                    {group.required
                      ? sel.length === 0
                        ? "Wajib pilih"
                        : "Wajib · terpilih"
                      : `Opsional${group.maxPick > 1 ? " · maks " + group.maxPick : ""}`}
                  </span>
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {group.options.map((opt) => {
                    const active = sel.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          toggle(group.id, opt.id, group.maxPick === 1)
                        }
                        aria-pressed={active}
                        className={cn(
                          "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition",
                          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-card hover:border-primary/50 hover:bg-accent/40"
                        )}
                      >
                        <span>{opt.name}</span>
                        {opt.priceDelta > 0 && (
                          <span
                            className={cn(
                              "tnum text-xs font-bold",
                              active ? "text-primary-foreground" : "text-primary"
                            )}
                          >
                            +{rupiah(opt.priceDelta)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          <div>
            <label
              htmlFor="note"
              className="mb-2 block text-sm font-bold"
            >
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
                className="flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
                className="flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
            <Button
              className="h-11 flex-1 rounded-full text-sm font-bold"
              disabled={!product.available || missingRequired}
              onClick={() => {
                onAdd(product, selectedMods, qty, note);
                handleOpen(false);
              }}
            >
              {missingRequired
                ? "Pilih opsi wajib dulu"
                : `Tambah · ${rupiah(unitPrice * qty)}`}
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
