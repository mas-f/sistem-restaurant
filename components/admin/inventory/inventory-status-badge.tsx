import { CircleCheck, TriangleAlert, XCircle, type LucideIcon } from "lucide-react";
import type { InventoryStatus } from "@/lib/inventory";
import { cn } from "@/lib/utils";

// PRD §26: status tidak boleh hanya warna — selalu ikon + label + warna.
const map: Record<
  InventoryStatus,
  { label: string; icon: LucideIcon; cls: string }
> = {
  IN_STOCK: {
    label: "Aman",
    icon: CircleCheck,
    cls: "bg-status-available-bg text-status-available-fg",
  },
  LOW_STOCK: {
    label: "Menipis",
    icon: TriangleAlert,
    cls: "bg-status-preparing-bg text-status-preparing-fg",
  },
  OUT_OF_STOCK: {
    label: "Habis",
    icon: XCircle,
    cls: "bg-status-error-bg text-status-error-fg",
  },
};

export function InventoryStatusBadge({
  status,
  compact = false,
}: {
  status: InventoryStatus;
  compact?: boolean;
}) {
  const s = map[status];
  const Icon = s.icon;

  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        s.cls
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {!compact && s.label}
    </span>
  );
}
