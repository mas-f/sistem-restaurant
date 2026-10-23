import type { MenuStation, PaymentMethod } from "@/lib/types";

/** Kode human-readable: ORD-20261021-AB12 / PAY-20261021-AB12. */
export function makeOrderCode(prefix: "ORD" | "PAY", date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = crypto.randomUUID().replace(/-/g, "").slice(0, 4).toUpperCase();
  return `${prefix}-${y}${m}${d}-${rand}`;
}

/** Station UI (Grill/Wok/Bar) → enum database lowercase. */
export function toDbStation(station: MenuStation | string): "grill" | "wok" | "bar" {
  const value = station.toLowerCase();
  if (value === "wok") return "wok";
  if (value === "bar") return "bar";
  return "grill";
}

/** Metode pembayaran UI (QRIS/CASH) → enum database lowercase. */
export function toDbPaymentMethod(method: PaymentMethod): "cash" | "qris" {
  return method === "CASH" ? "cash" : "qris";
}
