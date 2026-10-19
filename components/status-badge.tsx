import {
  Circle,
  Users,
  Clock,
  BellRing,
  Flame,
  CheckCircle2,
  Trash2,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KitchenStatus, OrderStatus, TableStatus, BillStatus } from "@/lib/types";

// PRD §26: status TIDAK boleh hanya warna — selalu ikon + label + warna.

type StatusKey =
  | TableStatus
  | OrderStatus
  | KitchenStatus
  | BillStatus
  | "PAID";

const map: Record<StatusKey, { label: string; icon: LucideIcon; cls: string }> = {
  AVAILABLE: { label: "Tersedia", icon: Circle, cls: "bg-status-available-bg text-status-available-fg" },
  OCCUPIED: { label: "Terisi", icon: Users, cls: "bg-status-occupied-bg text-status-occupied-fg" },
  WAITING_PAYMENT: { label: "Menunggu Bayar", icon: BellRing, cls: "bg-status-waiting-bg text-status-waiting-fg" },
  RESERVED: { label: "Dipesan", icon: CalendarCheck, cls: "bg-accent text-accent-foreground" },
  CLEANING: { label: "Dibersihkan", icon: Trash2, cls: "bg-muted text-muted-foreground" },
  PENDING: { label: "Baru", icon: BellRing, cls: "bg-status-waiting-bg text-status-waiting-fg" },
  CONFIRMED: { label: "Dikonfirmasi", icon: CheckCircle2, cls: "bg-accent text-accent-foreground" },
  PREPARING: { label: "Memasak", icon: Flame, cls: "bg-status-preparing-bg text-status-preparing-fg" },
  READY: { label: "Siap", icon: CheckCircle2, cls: "bg-status-ready-bg text-status-ready-fg" },
  COMPLETED: { label: "Selesai", icon: CheckCircle2, cls: "bg-status-available-bg text-status-available-fg" },
  CANCELLED: { label: "Dibatalkan", icon: Circle, cls: "bg-muted text-muted-foreground" },
  NEW: { label: "Baru", icon: BellRing, cls: "bg-status-waiting-bg text-status-waiting-fg" },
  ACCEPTED: { label: "Diterima", icon: CheckCircle2, cls: "bg-accent text-accent-foreground" },
  NOT_REQUESTED: { label: "Belum Diminta", icon: Circle, cls: "bg-muted text-muted-foreground" },
  REQUESTED: { label: "Tagihan Diminta", icon: BellRing, cls: "bg-status-waiting-bg text-status-waiting-fg" },
  PROCESSING: { label: "Diproses", icon: Clock, cls: "bg-status-preparing-bg text-status-preparing-fg" },
  PAID: { label: "Lunas", icon: CheckCircle2, cls: "bg-status-available-bg text-status-available-fg" },
};

export function StatusBadge({
  status,
  className,
  compact = false,
}: {
  status: StatusKey;
  className?: string;
  compact?: boolean;
}) {
  const s = map[status];
  const Icon = s.icon;
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        s.cls,
        className
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {!compact && s.label}
    </span>
  );
}
