import type { IngredientUnit } from "@/lib/generated/prisma/enums";

/**
 * Satu baris resep: pemakaian bahan per **satu porsi** produk.
 * File ini sengaja bebas dari `prisma` agar aman diimpor komponen client.
 */
export interface RecipeLine {
  ingredientId: string;
  ingredientName: string;
  unit: IngredientUnit | string;
  quantity: number;
  costPerUnit: number;
  stock: number;
  isActive: boolean;
}

export type ProductAvailability =
  | { state: "AVAILABLE"; portions: number }
  | { state: "OUT_OF_STOCK"; limitingIngredient: string }
  | { state: "NO_RECIPE" };

// Toleransi kecil agar 0,3 / 0,1 tidak jatuh ke 2 akibat floating point.
const PORTION_EPSILON = 1e-9;

/** HPP per porsi = Σ (jumlah bahan × harga satuan). */
export function recipeCost(lines: RecipeLine[]): number {
  return Math.round(
    lines.reduce((sum, line) => sum + line.quantity * line.costPerUnit, 0)
  );
}

/** Berapa porsi yang masih bisa dibuat dari stok saat ini. */
export function portionsForLines(lines: RecipeLine[]): {
  portions: number;
  limitingIngredient: string | null;
} {
  if (lines.length === 0) {
    return { portions: 0, limitingIngredient: null };
  }

  let portions = Number.POSITIVE_INFINITY;
  let limitingIngredient: string | null = null;

  for (const line of lines) {
    if (!(line.quantity > 0)) continue;

    // Bahan nonaktif dianggap tidak tersedia — produk tidak bisa dibuat.
    const usableStock = line.isActive ? Math.max(0, line.stock) : 0;
    const linePortions = Math.floor(
      (usableStock + PORTION_EPSILON) / line.quantity
    );

    if (linePortions < portions) {
      portions = linePortions;
      limitingIngredient = line.ingredientName;
    }
  }

  if (!Number.isFinite(portions)) {
    return { portions: 0, limitingIngredient: null };
  }

  return { portions, limitingIngredient };
}

export function availabilityFromLines(
  lines: RecipeLine[]
): ProductAvailability {
  if (lines.length === 0) return { state: "NO_RECIPE" };

  const { portions, limitingIngredient } = portionsForLines(lines);

  if (portions <= 0) {
    return {
      state: "OUT_OF_STOCK",
      limitingIngredient:
        limitingIngredient ?? lines[0]?.ingredientName ?? "bahan baku",
    };
  }

  return { state: "AVAILABLE", portions };
}

export function isProductAvailable(availability: ProductAvailability): boolean {
  return availability.state === "AVAILABLE";
}

/** Alasan singkat untuk badge/daftar menu yang tidak bisa dipesan. */
export function availabilityReason(availability: ProductAvailability): string {
  switch (availability.state) {
    case "NO_RECIPE":
      return "Belum ada resep bahan";
    case "OUT_OF_STOCK":
      return `Stok ${availability.limitingIngredient} habis`;
    default:
      return `Tersedia ${availability.portions} porsi`;
  }
}
