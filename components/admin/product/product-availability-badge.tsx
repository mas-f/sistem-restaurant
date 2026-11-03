import {
  CircleCheck,
  CircleAlert,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { ProductAvailability } from "@/lib/recipe";
import { cn } from "@/lib/utils";

// PRD §26: status selalu ikon + label + warna, bukan warna saja.
const map: Record<
  ProductAvailability["state"],
  { label: string; icon: LucideIcon; cls: string }
> = {
  AVAILABLE: {
    label: "Tersedia",
    icon: CircleCheck,
    cls: "bg-status-available-bg text-status-available-fg",
  },
  OUT_OF_STOCK: {
    label: "Stok habis",
    icon: XCircle,
    cls: "bg-status-error-bg text-status-error-fg",
  },
  NO_RECIPE: {
    label: "Tanpa resep",
    icon: CircleAlert,
    cls: "bg-status-preparing-bg text-status-preparing-fg",
  },
};

export function ProductAvailabilityBadge({
  availability,
  compact = false,
}: {
  availability: ProductAvailability;
  compact?: boolean;
}) {
  const state = map[availability.state];
  const Icon = state.icon;
  const label =
    availability.state === "AVAILABLE" && availability.portions < 5
      ? `Tersedia ${availability.portions}`
      : state.label;

  return (
    <span
      data-status={availability.state}
      title={
        availability.state === "AVAILABLE"
          ? `Sisa ${availability.portions} porsi`
          : availability.state === "OUT_OF_STOCK"
            ? `Stok ${availability.limitingIngredient} habis`
            : "Menu belum punya resep bahan"
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
        state.cls
      )}
    >
      <Icon className="size-3 shrink-0" aria-hidden />
      {!compact && label}
    </span>
  );
}
