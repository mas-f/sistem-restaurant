"use client";

import { Plus, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { rupiah } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: (p: Product) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      disabled={!product.available}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left",
        "shadow-[0_2px_4px_-1px_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_15px_-3px_rgba(15,23,42,0.1),0_4px_6px_-2px_rgba(15,23,42,0.05)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        "active:translate-y-0",
        !product.available && "cursor-not-allowed opacity-55 hover:translate-y-0"
      )}
      aria-label={`${product.name}, ${rupiah(product.price)}${
        product.available ? "" : ", tidak tersedia"
      }`}
    >
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-secondary to-accent/40 sm:h-32">
        <span className="text-5xl drop-shadow-sm" aria-hidden>
          {product.imageEmoji}
        </span>
        {product.popular && product.available && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-status-waiting-bg px-2 py-0.5 text-[11px] font-bold text-status-waiting-fg">
            <Star className="size-3 fill-current" aria-hidden />
            Favorit
          </span>
        )}
        {!product.available && (
          <span className="absolute top-2 left-2 rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
            Habis
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="font-heading text-sm leading-snug font-bold">
          {product.name}
        </p>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="tnum text-sm font-extrabold text-primary">
            {rupiah(product.price)}
          </span>
          {product.available && (
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
              <Plus className="size-4" aria-hidden />
            </span>
          )}
        </div>
      </div>
      {!product.available && (
        <span className="sr-only">Tidak tersedia</span>
      )}
    </button>
  );
}
