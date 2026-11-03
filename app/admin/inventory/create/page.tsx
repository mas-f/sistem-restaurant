import { InventoryFormScreen } from "@/components/admin/inventory/inventory-form-screen";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function CreateIngredientPage() {
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <InventoryFormScreen suppliers={suppliers} />;
}
