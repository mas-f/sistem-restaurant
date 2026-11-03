import { prisma } from "@/lib/prisma";
import {
  inventoryStatus,
  sortByStockRatio,
  type LowStockItem,
} from "@/lib/inventory";

/**
 * Bahan aktif yang sudah habis atau berada di bawah ambang minimum.
 * Dipisahkan dari `lib/inventory.ts` (pure helper) supaya file itu aman
 * diimpor komponen client tanpa menarik driver database.
 */
export async function getLowStockIngredients(
  limit = 6
): Promise<LowStockItem[]> {
  const rows = await prisma.ingredient.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      unit: true,
      stock: true,
      minStock: true,
    },
  });

  const mapped: LowStockItem[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
    stock: Number(row.stock),
    minStock: Number(row.minStock),
  }));

  return sortByStockRatio(
    mapped.filter(
      (row) => inventoryStatus(row.stock, row.minStock) !== "IN_STOCK"
    )
  ).slice(0, limit);
}
