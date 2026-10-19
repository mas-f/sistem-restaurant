"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, ShoppingBasket, X } from "lucide-react";
import { RestaurantHeader } from "@/components/customer/restaurant-header";
import { ProductCard } from "@/components/customer/product-card";
import { ProductDetailDialog } from "@/components/customer/product-detail-dialog";
import { categories, products, rupiah } from "@/lib/mock-data";
import type { Modifier, Product } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MenuScreen({
  tableCode,
  tableToken,
  guestLabel,
}: {
  tableCode: string;
  tableToken: string;
  guestLabel: string;
}) {
  const [activeCat, setActiveCat] = useState("cat-1");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Product | null>(null);
  const { cart, addToCart, toast } = useStore();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = activeCat === "cat-1" || p.categoryId === activeCat;
      const qOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [activeCat, query]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce(
    (s, i) => s + (i.unitPrice + i.modifierDelta) * i.quantity,
    0
  );

  const handleAdd = (p: Product, mods: Modifier[], qty: number, note: string) => {
    addToCart({
      id: `${p.id}-${Date.now()}`,
      productId: p.id,
      productName: p.name,
      quantity: qty,
      unitPrice: p.price,
      modifierNames: mods.map((m) => m.name),
      modifierDelta: mods.reduce((s, m) => s + m.priceDelta, 0),
      note,
      station:
        p.categoryId === "cat-4" ? "Bar" : p.categoryId === "cat-3" ? "Wok" : "Grill",
    });
    toast({
      title: "Ditambahkan ke keranjang",
      description: `${qty}× ${p.name}`,
      tone: "success",
    });
  };

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-3xl pb-32">
      <RestaurantHeader tableCode={tableCode} />

      <div className="px-4 pt-4">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {guestLabel}
        </p>

        {/* Search */}
        <div className="relative mt-3">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari menu…"
            aria-label="Cari menu"
            className="h-11 w-full rounded-full border border-border bg-card pr-10 pl-10 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Bersihkan pencarian"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div
        role="tablist"
        aria-label="Kategori menu"
        className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((c) => {
          const active = c.id === activeCat;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCat(c.id)}
              className={cn(
                "h-9 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent/50"
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Product grid */}
      <main className="px-4 pt-5">
        {filtered.length === 0 ? (
          <div className="animate-rise flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Search className="size-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="font-heading font-bold">Menu tidak ditemukan</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Coba kata kunci lain atau pilih kategori “Semua”.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setActiveCat("cat-1");
              }}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Reset filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {filtered.map((p, i) => (
              <div
                key={p.id}
                className={cn("animate-rise", `stagger-${Math.min(i % 6, 4)}`)}
              >
                <ProductCard product={p} onOpen={setDetail} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
          <div className="mx-auto max-w-3xl">
            <Link
              href={`/order/cart?token=${encodeURIComponent(tableToken)}`}
              className="animate-rise flex items-center gap-3 rounded-full border border-primary bg-primary px-4 py-3 text-primary-foreground shadow-[0_10px_25px_-5px_rgba(234,88,12,0.5)] transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:translate-y-px"
            >
              <span className="tnum flex size-7 items-center justify-center rounded-full bg-primary-foreground text-xs font-extrabold text-primary">
                {cartCount}
              </span>
              <span className="flex-1 text-left">
                <span className="block text-sm leading-tight font-bold">
                  Lihat keranjang
                </span>
                <span className="tnum block text-xs opacity-90">
                  {rupiah(cartTotal)}
                </span>
              </span>
              <ShoppingBasket className="size-5" aria-hidden />
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}

      <ProductDetailDialog
        product={detail}
        onOpenChange={(o) => !o && setDetail(null)}
        onAdd={handleAdd}
      />
    </div>
  );
}
