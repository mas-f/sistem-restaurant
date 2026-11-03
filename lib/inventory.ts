import type {
  IngredientUnit,
  StockMovementType,
} from "@/lib/generated/prisma/enums";

/**
 * Status inventaris mengikuti PRD §16. Status tidak disimpan di database —
 * selalu dihitung dari stok saat ini agar tidak pernah basi.
 */
export type InventoryStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export const INVENTORY_UNITS: { value: IngredientUnit; label: string }[] = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "gram", label: "Gram (g)" },
  { value: "liter", label: "Liter (L)" },
  { value: "ml", label: "Mililiter (ml)" },
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "pack", label: "Pak (pack)" },
];

/** Singkatan satuan untuk kolom tabel — mis. 4,2 kg. */
export const UNIT_ABBREVIATION: Record<IngredientUnit, string> = {
  kg: "kg",
  gram: "g",
  liter: "L",
  ml: "ml",
  pcs: "pcs",
  pack: "pack",
};

export const STOCK_MOVEMENT_LABEL: Record<StockMovementType, string> = {
  in: "Masuk",
  out: "Keluar",
  adjustment: "Penyesuaian",
};

export function isIngredientUnit(value: string): value is IngredientUnit {
  return INVENTORY_UNITS.some((unit) => unit.value === value);
}

export function inventoryStatus(
  stock: number,
  minStock: number
): InventoryStatus {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock < minStock) return "LOW_STOCK";
  return "IN_STOCK";
}

export function formatQuantity(
  value: number,
  unit: IngredientUnit | string
): string {
  const amount = value.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
  const suffix =
    UNIT_ABBREVIATION[unit as IngredientUnit] ?? String(unit);
  return `${amount} ${suffix}`;
}

export function ingredientValue(stock: number, costPerUnit: number): number {
  return Math.round(stock * costPerUnit);
}

export type LowStockItem = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
};

export function sortByStockRatio<T extends { stock: number; minStock: number }>(
  rows: T[]
): T[] {
  return [...rows].sort((a, b) => {
    const aRatio = a.minStock > 0 ? a.stock / a.minStock : 0;
    const bRatio = b.minStock > 0 ? b.stock / b.minStock : 0;
    return aRatio - bRatio;
  });
}

