import { SuppliersScreen } from "@/components/admin/supplier/suppliers-screen";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      contact: true,
      phone: true,
      email: true,
      address: true,
      isActive: true,
      _count: { select: { ingredients: true } },
    },
  });

  return (
    <SuppliersScreen
      suppliers={suppliers.map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        isActive: supplier.isActive,
        ingredientCount: supplier._count.ingredients,
      }))}
    />
  );
}
