"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { OrdersTable } from "@/components/admin/orders-table";
import { SignOutButton } from "@/components/sign-out-button";
import {
  ORDER_STATUS_FILTERS,
  type OrderStatusFilter,
} from "@/lib/order-filters";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 350;

export interface AdminOrdersScreenProps {
  orders: Order[];
  q: string;
  status: OrderStatusFilter;
  page: number;
  totalPages: number;
  total: number;
  showingFrom: number;
  showingTo: number;
}

export function AdminOrdersScreen({
  orders,
  q,
  status,
  page,
  totalPages,
  total,
  showingFrom,
  showingTo,
}: AdminOrdersScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(q);
  const [lastQ, setLastQ] = useState(q);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sinkronkan input bila parameter berubah dari luar (back/forward browser),
  // disesuaikan saat render agar tidak memicu cascading render.
  if (q !== lastQ) {
    setLastQ(q);
    setQuery(q);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /** Tulis parameter ke URL — halaman server yang membaca ulang datanya. */
  const navigate = (next: {
    q?: string;
    status?: OrderStatusFilter;
    page?: number;
  }) => {
    const nextQ = (next.q ?? query).trim();
    const nextStatus = next.status ?? status;
    const nextPage = next.page ?? 1;

    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextStatus !== "ALL") params.set("status", nextStatus);
    if (nextPage > 1) params.set("page", String(nextPage));

    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate({ q: value, page: 1 });
    }, DEBOUNCE_MS);
  };

  const isFiltered = status !== "ALL" || query.trim().length > 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Semua pesanan lintas meja, satu sumber kebenaran dengan dapur &amp;
            kasir.
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Cari order / meja…"
            aria-label="Cari order"
            className="h-9 w-full rounded-full border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          />
        </div>
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filter status order"
        >
          {ORDER_STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => navigate({ status: filter.key, page: 1 })}
              aria-pressed={status === filter.key}
              className={cn(
                "h-8 cursor-pointer rounded-full border px-3 text-xs font-bold transition",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                status === filter.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent/50"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-card transition-opacity",
          isPending && "opacity-60"
        )}
        aria-busy={isPending}
      >
        <OrdersTable
          orders={orders}
          emptyTitle={isFiltered ? "Tidak ada order yang cocok" : "Belum ada order"}
          emptyHint={
            isFiltered
              ? "Coba ubah filter status atau kata kunci pencarian."
              : "Order dari meja tamu akan muncul di sini."
          }
        />
      </div>

      {total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="tnum text-xs text-muted-foreground" aria-live="polite">
            Menampilkan {showingFrom}–{showingTo} dari {total} order
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate({ page: page - 1 })}
              disabled={page <= 1 || isPending}
              className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-bold transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-3.5" aria-hidden /> Sebelumnya
            </button>
            <span className="tnum text-xs font-bold text-muted-foreground">
              Halaman {page} dari {totalPages}
            </span>
            <button
              type="button"
              onClick={() => navigate({ page: page + 1 })}
              disabled={page >= totalPages || isPending}
              className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-bold transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              Berikutnya <ChevronRight className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
