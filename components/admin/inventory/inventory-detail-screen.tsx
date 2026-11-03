import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  Package,
  Pencil,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { InventoryStatusBadge } from "@/components/admin/inventory/inventory-status-badge";
import { InventoryDeleteButton } from "@/components/admin/inventory/inventory-delete-button";
import { InventoryActiveToggle } from "@/components/admin/inventory/inventory-active-toggle";
import { StockAdjustDialog } from "@/components/admin/inventory/stock-adjust-dialog";
import { TimeLabel } from "@/components/time-label";
import { formatQuantity, type InventoryStatus } from "@/lib/inventory";
import type {
  IngredientUnit,
  StockMovementType,
} from "@/lib/generated/prisma/enums";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface StockMovementRow {
  id: string;
  type: StockMovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  note: string;
  createdAt: string;
  createdByName: string | null;
}

export interface IngredientDetailData {
  id: string;
  name: string;
  unit: IngredientUnit;
  stock: number;
  minStock: number;
  costPerUnit: number;
  value: number;
  status: InventoryStatus;
  isActive: boolean;
  supplierName: string | null;
  createdAt: string;
  movements: StockMovementRow[];
}

const MOVEMENT_STYLE: Record<
  StockMovementType,
  { label: string; icon: LucideIcon; cls: string }
> = {
  in: {
    label: "Masuk",
    icon: ArrowDownToLine,
    cls: "bg-status-available-bg text-status-available-fg",
  },
  out: {
    label: "Keluar",
    icon: ArrowUpFromLine,
    cls: "bg-status-preparing-bg text-status-preparing-fg",
  },
  adjustment: {
    label: "Penyesuaian",
    icon: ClipboardCheck,
    cls: "bg-status-waiting-bg text-status-waiting-fg",
  },
};

export function InventoryDetailScreen({
  ingredient,
}: {
  ingredient: IngredientDetailData;
}) {
  const target = ingredient.minStock * 1.5;
  const pct =
    ingredient.status === "OUT_OF_STOCK"
      ? 0
      : target > 0
        ? Math.min(100, (ingredient.stock / target) * 100)
        : 100;

  const summary = [
    { label: "Stok Saat Ini", value: formatQuantity(ingredient.stock, ingredient.unit) },
    { label: "Stok Minimum", value: formatQuantity(ingredient.minStock, ingredient.unit) },
    { label: "Harga per Unit", value: rupiah(ingredient.costPerUnit) },
    { label: "Nilai Stok", value: rupiah(ingredient.value) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/inventory"
          className="text-xs font-bold text-muted-foreground hover:text-primary hover:underline"
        >
          ← Kembali ke inventaris
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold">
              {ingredient.name}
            </h1>
            {ingredient.isActive ? (
              <InventoryStatusBadge status={ingredient.status} />
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                <TriangleAlert className="size-3" aria-hidden />
                Nonaktif
              </span>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Package className="size-3.5" aria-hidden />
              Supplier: {ingredient.supplierName ?? "—"}
            </span>
            <span>
              Terdaftar <TimeLabel iso={ingredient.createdAt} variant="date" />
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ingredient.isActive ? (
            <StockAdjustDialog
              ingredientId={ingredient.id}
              name={ingredient.name}
              unit={ingredient.unit}
              stock={ingredient.stock}
              trigger="button"
            />
          ) : null}
          <Link
            href={`/admin/inventory/${ingredient.id}/edit`}
            className={buttonVariants({
              variant: "outline",
              className: "h-9 rounded-full px-4 text-sm font-bold",
            })}
          >
            <Pencil className="size-4" aria-hidden /> Edit
          </Link>
          <InventoryActiveToggle
            ingredientId={ingredient.id}
            isActive={ingredient.isActive}
          />
          <InventoryDeleteButton
            ingredientId={ingredient.id}
            ingredientName={ingredient.name}
            hasHistory={ingredient.movements.length > 0}
          />
        </div>
      </div>

      {!ingredient.isActive ? (
        <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Bahan ini nonaktif — tidak dihitung di KPI dashboard dan tidak muncul
          di daftar default. Riwayat stoknya tetap disimpan.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs font-semibold text-muted-foreground">
              {item.label}
            </p>
            <p className="tnum mt-1.5 font-heading text-lg font-extrabold">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <section
        aria-label="Level stok"
        className="rounded-xl border border-border bg-card p-4"
      >
        <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
          <span className="font-semibold">Level stok</span>
          <span className="tnum text-xs text-muted-foreground">
            min. {formatQuantity(ingredient.minStock, ingredient.unit)}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={Math.round(pct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Stok ${ingredient.name}`}
          className="h-2.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn(
              "h-full rounded-full",
              ingredient.status === "OUT_OF_STOCK"
                ? "bg-status-error"
                : ingredient.status === "LOW_STOCK"
                  ? "bg-status-preparing"
                  : "bg-status-available"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {ingredient.status === "OUT_OF_STOCK"
            ? "Stok habis — catat stok masuk untuk mengisi kembali."
            : ingredient.status === "LOW_STOCK"
              ? "Stok di bawah ambang minimum — segera lakukan restock."
              : "Stok berada di atas ambang minimum."}
        </p>
      </section>

      <section aria-label="Riwayat pergerakan stok" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-extrabold">
            Riwayat Pergerakan Stok
          </h2>
          <span className="tnum text-xs text-muted-foreground">
            {ingredient.movements.length} catatan terakhir
          </span>
        </div>

        {ingredient.movements.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  <th className="px-4 py-2.5">Waktu</th>
                  <th className="px-4 py-2.5">Tipe</th>
                  <th className="px-4 py-2.5 text-right">Perubahan</th>
                  <th className="px-4 py-2.5">Sebelum → Sesudah</th>
                  <th className="px-4 py-2.5">Catatan</th>
                  <th className="px-4 py-2.5">Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ingredient.movements.map((movement) => {
                  const style = MOVEMENT_STYLE[movement.type];
                  const Icon = style.icon;
                  const positive = movement.quantity > 0;

                  return (
                    <tr key={movement.id} className="hover:bg-secondary/40">
                      <td className="tnum px-4 py-3 whitespace-nowrap">
                        <TimeLabel iso={movement.createdAt} variant="date" />
                        <span className="ml-1.5 text-muted-foreground">
                          <TimeLabel iso={movement.createdAt} />
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                            style.cls
                          )}
                        >
                          <Icon className="size-3" aria-hidden />
                          {style.label}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "tnum px-4 py-3 text-right font-bold",
                          positive
                            ? "text-status-available-fg"
                            : "text-status-preparing-fg"
                        )}
                      >
                        {positive ? "+" : "−"}
                        {formatQuantity(Math.abs(movement.quantity), ingredient.unit)}
                      </td>
                      <td className="tnum px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {formatQuantity(movement.stockBefore, ingredient.unit)} →{" "}
                        <strong className="text-foreground">
                          {formatQuantity(movement.stockAfter, ingredient.unit)}
                        </strong>
                      </td>
                      <td className="max-w-64 px-4 py-3 text-muted-foreground">
                        {movement.note || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {movement.createdByName ?? "Sistem"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <ClipboardCheck
              className="mx-auto size-6 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-2 font-heading font-bold">Belum ada mutasi stok</p>
            <p className="text-sm text-muted-foreground">
              Catat stok masuk atau keluar agar riwayatnya muncul di sini.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
