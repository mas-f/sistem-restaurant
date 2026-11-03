"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { OrdersTable } from "@/components/admin/orders-table";
import { SignOutButton } from "@/components/sign-out-button";
import {
  ORDER_STATUS_FILTERS,
  type OrderStatusFilter,
} from "@/lib/order-filters";
import type { Order } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OrdersScreen({ orders }: { orders: Order[] }) {
  const [f, setF] = useState<OrderStatusFilter>("ALL");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return orders.filter((order) => {
      if (f !== "ALL" && order.status !== f) return false;
      if (
        query &&
        !`${order.code} ${order.tableCode}`.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [orders, f, q]);

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
            value={q}
            onChange={(event) => setQ(event.target.value)}
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
              onClick={() => setF(filter.key)}
              aria-pressed={f === filter.key}
              className={cn(
                "h-8 cursor-pointer rounded-full border px-3 text-xs font-bold transition",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                f === filter.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent/50"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <OrdersTable orders={list} />
      </div>
    </div>
  );
}
