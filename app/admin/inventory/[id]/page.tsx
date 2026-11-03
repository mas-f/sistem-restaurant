import { notFound } from "next/navigation";
import {
  InventoryDetailScreen,
  type StockMovementRow,
} from "@/components/admin/inventory/inventory-detail-screen";
import { prisma } from "@/lib/prisma";
import { ingredientValue, inventoryStatus } from "@/lib/inventory";

export const instant = false;

const MOVEMENT_LIMIT = 50;

export default async function IngredientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const ingredient = await prisma.ingredient.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      unit: true,
      stock: true,
      minStock: true,
      costPerUnit: true,
      isActive: true,
      createdAt: true,
      supplier: { select: { name: true } },
      recipes: {
        select: { product: { select: { id: true, name: true } } },
        orderBy: { product: { name: "asc" } },
      },
      movements: {
        orderBy: { createdAt: "desc" },
        take: MOVEMENT_LIMIT,
        select: {
          id: true,
          type: true,
          quantity: true,
          stockBefore: true,
          stockAfter: true,
          note: true,
          createdAt: true,
          createdBy: { select: { name: true } },
        },
      },
    },
  });

  if (!ingredient) notFound();

  const stock = Number(ingredient.stock);
  const minStock = Number(ingredient.minStock);

  const movements: StockMovementRow[] = ingredient.movements.map((movement) => ({
    id: movement.id,
    type: movement.type,
    quantity: Number(movement.quantity),
    stockBefore: Number(movement.stockBefore),
    stockAfter: Number(movement.stockAfter),
    note: movement.note,
    createdAt: movement.createdAt.toISOString(),
    createdByName: movement.createdBy?.name ?? null,
  }));

  return (
    <InventoryDetailScreen
      ingredient={{
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
        stock,
        minStock,
        costPerUnit: ingredient.costPerUnit,
        value: ingredientValue(stock, ingredient.costPerUnit),
        status: inventoryStatus(stock, minStock),
        isActive: ingredient.isActive,
        supplierName: ingredient.supplier?.name ?? null,
        createdAt: ingredient.createdAt.toISOString(),
        usedInProducts: ingredient.recipes.map((row) => ({
          id: row.product.id,
          name: row.product.name,
        })),
        movements,
      }}
    />
  );
}
