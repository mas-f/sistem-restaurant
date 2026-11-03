import { prisma } from "@/lib/prisma";
import {
  availabilityFromLines,
  type ProductAvailability,
  type RecipeLine,
} from "@/lib/recipe";

const INGREDIENT_SELECT = {
  id: true,
  name: true,
  unit: true,
  stock: true,
  costPerUnit: true,
  isActive: true,
} as const;

type RecipeRow = {
  quantity: unknown;
  ingredient: {
    id: string;
    name: string;
    unit: string;
    stock: unknown;
    costPerUnit: number;
    isActive: boolean;
  };
};

function toRecipeLine(row: RecipeRow): RecipeLine {
  return {
    ingredientId: row.ingredient.id,
    ingredientName: row.ingredient.name,
    unit: row.ingredient.unit,
    quantity: Number(row.quantity),
    costPerUnit: row.ingredient.costPerUnit,
    stock: Number(row.ingredient.stock),
    isActive: row.ingredient.isActive,
  };
}

/** Resep satu produk, terurut nama bahan. */
export async function getProductRecipes(
  productId: string
): Promise<RecipeLine[]> {
  const rows = await prisma.recipeItem.findMany({
    where: { productId },
    orderBy: { ingredient: { name: "asc" } },
    select: { quantity: true, ingredient: { select: INGREDIENT_SELECT } },
  });

  return rows.map(toRecipeLine);
}

/**
 * Ketersediaan beberapa produk sekaligus. Produk tanpa resep tetap masuk
 * peta dengan status NO_RECIPE supaya pemanggil tidak perlu menebak.
 */
export async function getProductAvailabilityMap(
  productIds: string[]
): Promise<Map<string, ProductAvailability>> {
  const result = new Map<string, ProductAvailability>();
  if (productIds.length === 0) return result;

  const rows = await prisma.recipeItem.findMany({
    where: { productId: { in: productIds } },
    select: {
      productId: true,
      quantity: true,
      ingredient: { select: INGREDIENT_SELECT },
    },
  });

  const byProduct = new Map<string, RecipeLine[]>();
  for (const row of rows) {
    const list = byProduct.get(row.productId) ?? [];
    list.push(toRecipeLine(row));
    byProduct.set(row.productId, list);
  }

  for (const id of productIds) {
    result.set(id, availabilityFromLines(byProduct.get(id) ?? []));
  }

  return result;
}

/** Semua produk (nama + alasan) yang saat ini tidak bisa dipesan. */
export async function getUnavailableProducts(limit = 8) {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      recipeItems: {
        select: { quantity: true, ingredient: { select: INGREDIENT_SELECT } },
      },
    },
  });

  const unavailable = products
    .map((product) => ({
      id: product.id,
      name: product.name,
      availability: availabilityFromLines(product.recipeItems.map(toRecipeLine)),
    }))
    .filter((product) => product.availability.state !== "AVAILABLE");

  return unavailable.slice(0, limit);
}

/** Jumlah produk yang belum punya resep sama sekali. */
export async function countProductsWithoutRecipe(): Promise<number> {
  return prisma.product.count({ where: { recipeItems: { none: {} } } });
}
