"use client";

import { ClipboardList } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { TimeLabel } from "@/components/time-label";
import { rupiah } from "@/lib/format";
import type { Order } from "@/lib/types";

/**
 * Tabel order tanpa state — dipakai halaman admin (berpaginasi) dan staff
 * (tanpa pagination) agar tampilan keduanya tidak menyimpang.
 */
export function OrdersTable({
  orders,
  emptyTitle = "Tidak ada order",
  emptyHint = "Coba ubah filter atau kata kunci.",
}: {
  orders: Order[];
  emptyTitle?: string;
  emptyHint?: string;
}) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center">
        <ClipboardList className="size-6 text-muted-foreground" aria-hidden />
        <p className="text-sm font-semibold">{emptyTitle}</p>
        <p className="text-xs text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/60 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
            <th className="px-4 py-2.5">Order</th>
            <th className="px-4 py-2.5">Meja</th>
            <th className="px-4 py-2.5">Item</th>
            <th className="px-4 py-2.5 text-right">Total</th>
            <th className="px-4 py-2.5">Waktu</th>
            <th className="px-4 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => {
            const total =
              order.total ??
              order.items.reduce(
                (sum, item) =>
                  sum + (item.unitPrice + item.modifierDelta) * item.quantity,
                0
              );

            return (
              <tr key={order.id} className="hover:bg-secondary/40">
                <td className="tnum px-4 py-3 font-semibold">{order.code}</td>
                <td className="px-4 py-3 font-bold">{order.tableCode}</td>
                <td className="max-w-56 truncate px-4 py-3 text-muted-foreground">
                  {order.items
                    .map((item) => `${item.quantity}× ${item.productName}`)
                    .join(", ")}
                </td>
                <td className="tnum px-4 py-3 text-right font-bold">
                  {rupiah(total)}
                </td>
                <td className="tnum px-4 py-3 text-muted-foreground">
                  <TimeLabel iso={order.createdAt} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
