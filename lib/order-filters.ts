import type { OrderStatus } from "@/lib/types";

// File ini bebas `prisma` agar bisa diimpor komponen client (filter order).
// Enum database lowercase → tipe UI uppercase (PRD §26).

export type DbOrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export const ORDER_STATUS_TO_DB: Record<OrderStatus, DbOrderStatus> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY: "ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

/** "ALL" = tanpa filter status. */
export type OrderStatusFilter = "ALL" | OrderStatus;

export const ORDER_STATUS_FILTERS: {
  key: OrderStatusFilter;
  label: string;
}[] = [
  { key: "ALL", label: "Semua" },
  { key: "PENDING", label: "Baru" },
  { key: "CONFIRMED", label: "Dikonfirmasi" },
  { key: "PREPARING", label: "Memasak" },
  { key: "READY", label: "Siap" },
  { key: "COMPLETED", label: "Selesai" },
  { key: "CANCELLED", label: "Dibatalkan" },
];

/** Panjang maksimum kata kunci pencarian order (dipakai server & client). */
export const ORDER_QUERY_MAX = 80;

/** Parameter `?status=` dari URL → filter yang valid (nilai asing jadi ALL). */
export function parseOrderStatusFilter(value: unknown): OrderStatusFilter {
  if (typeof value !== "string") return "ALL";

  const raw = value.trim().toUpperCase();
  const match = ORDER_STATUS_FILTERS.find((filter) => filter.key === raw);
  return match ? match.key : "ALL";
}
