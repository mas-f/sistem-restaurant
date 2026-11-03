import { notFound } from "next/navigation";
import { ProductFormScreen } from "@/components/admin/product/product-form-screen";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { _count: { select: { recipeItems: true } } },
    }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <ProductFormScreen
      categories={categories}
      recipeCount={product._count.recipeItems}
      product={{
        id: product.id,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        price: product.price,
        imageUrl: product.imageUrl,
      }}
    />
  );
}
