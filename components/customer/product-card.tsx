"use client";

import { AlertTriangle, Plus, XCircle } from "lucide-react";
import { ProductImage } from "@/components/customer/product-image";
import { rupiah } from "@/lib/format";
import { LOW_PORTION_THRESHOLD } from "@/lib/menu";
import type { MenuProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  onOpen,
}: {
  product: MenuProduct;
  onOpen: (p: MenuProduct) => void;
}) {
  // Sisa porsi sedikit masih bisa dipesan — hanya diberi badge peringatan.
  const lowStock =
    product.available && product.portions <= LOW_PORTION_THRESHOLD;

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left",
        "shadow-[0_2px_4px_-1px_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_10px_15px_-3px_rgba(15,23,42,0.1),0_4px_6px_-2px_rgba(15,23,42,0.05)]",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        "active:translate-y-0 cursor-pointer"
      )}
      aria-label={`${product.name}, ${rupiah(product.price)}${
        !product.available
          ? ", sedang habis"
          : lowStock
            ? `, sisa ${product.portions} porsi`
            : ""
      }`}
    >
      <div className="relative h-28 w-full overflow-hidden bg-linear-to-br from-secondary to-accent/40 sm:h-32">
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          sizes="(max-width: 640px) 50vw, 33vw"
          className={cn(
            "transition-transform duration-300 group-hover:scale-105",
            !product.available && "opacity-60 grayscale"
          )}
        />
        {!product.available ? (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-status-error-bg px-2 py-0.5 text-[11px] font-bold text-status-error-fg shadow-xs">
            <XCircle className="size-3" aria-hidden /> Habis
          </span>
        ) : lowStock ? (
          <span className="tnum absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-status-preparing-bg px-2 py-0.5 text-[11px] font-bold text-status-preparing-fg shadow-xs">
            <AlertTriangle className="size-3" aria-hidden /> Sisa{" "}
            {product.portions} porsi
          </span>
        ) : null}
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
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full transition-transform",
              product.available
                ? "bg-primary text-primary-foreground group-hover:scale-110"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Plus className="size-4" aria-hidden />
          </span>
        </div>
      </div>
    </button>
  );
}
