"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Search,
  ShoppingBasket,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { RestaurantHeader } from "@/components/customer/restaurant-header";
import { ProductCard } from "@/components/customer/product-card";
import { ProductDetailDialog } from "@/components/customer/product-detail-dialog";
import { rupiah } from "@/lib/format";
import { ALL_CATEGORY_ID } from "@/lib/menu";
import { useStore } from "@/lib/store";
import type { MenuCategory, MenuProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MenuScreen({
  tableCode,
  tableToken,
  seats,
  guestLabel,
  categories,
  products,
}: {
  tableCode: string;
  tableToken: string;
  seats: number;
  guestLabel: string;
  categories: MenuCategory[];
  products: MenuProduct[];
}) {
  const [activeCat, setActiveCat] = useState(ALL_CATEGORY_ID);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<MenuProduct | null>(null);
  const { cart, addToCart, toast } = useStore();

  // Kategori DB tampil semua (termasuk yang masih kosong) + tab "Semua".
  const tabs = [{ id: ALL_CATEGORY_ID, name: "Semua" }, ...categories];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = activeCat === ALL_CATEGORY_ID || p.categoryId === activeCat;
      const qOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [activeCat, query, products]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce(
    (s, i) => s + (i.unitPrice + i.modifierDelta) * i.quantity,
    0
  );

  const handleAdd = (p: MenuProduct, qty: number, note: string) => {
    addToCart({
      id: `${p.id}-${Date.now()}`,
      productId: p.id,
      productName: p.name,
      quantity: qty,
      unitPrice: p.price,
      modifierNames: [],
      modifierDelta: 0,
      note,
      station: p.station,
    });
    toast({
      title: "Ditambahkan ke keranjang",
      description: `${qty}× ${p.name}`,
      tone: "success",
    });
  };

  const resetFilter = () => {
    setQuery("");
    setActiveCat(ALL_CATEGORY_ID);
  };

  const hasProducts = products.length > 0;
  const isSearching = query.trim().length > 0;

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-3xl pb-32">
      <RestaurantHeader tableCode={tableCode} seats={seats} />

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
        className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((c) => {
          const active = c.id === activeCat;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveCat(c.id)}
              className={cn(
                "h-9 shrink-0 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer",
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
        {!hasProducts ? (
          <div className="animate-rise flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <UtensilsCrossed
                className="size-6 text-muted-foreground"
                aria-hidden
              />
            </div>
            <p className="font-heading font-bold">Menu belum tersedia</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Belum ada produk yang bisa dipesan saat ini. Silakan panggil staf
              kami.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-rise flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Search className="size-6 text-muted-foreground" aria-hidden />
            </div>
            <p className="font-heading font-bold">
              {isSearching
                ? "Menu tidak ditemukan"
                : "Belum ada menu di kategori ini"}
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {isSearching
                ? "Coba kata kunci lain atau pilih kategori “Semua”."
                : "Pilih kategori lain atau lihat semua menu yang tersedia."}
            </p>
            <button
              onClick={resetFilter}
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
