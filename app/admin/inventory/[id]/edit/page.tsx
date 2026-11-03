import { notFound } from "next/navigation";
import { InventoryFormScreen } from "@/components/admin/inventory/inventory-form-screen";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function EditIngredientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [ingredient, suppliers] = await Promise.all([
    prisma.ingredient.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        unit: true,
        minStock: true,
        costPerUnit: true,
        supplierId: true,
        isActive: true,
        _count: { select: { movements: true } },
      },
    }),
    prisma.supplier.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!ingredient) notFound();

  return (
    <InventoryFormScreen
      suppliers={suppliers}
      ingredient={{
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
        minStock: Number(ingredient.minStock),
        costPerUnit: ingredient.costPerUnit,
        supplierId: ingredient.supplierId,
        isActive: ingredient.isActive,
        movementCount: ingredient._count.movements,
      }}
    />
  );
}
