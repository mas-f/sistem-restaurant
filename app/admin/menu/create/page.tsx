import { ProductFormScreen } from "@/components/admin/product/product-form-screen";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function CreateProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return <ProductFormScreen categories={categories} />;
}
