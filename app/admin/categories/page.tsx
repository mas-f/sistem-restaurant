import { CategoriesScreen } from "@/components/admin/categories-screen";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function Page() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <CategoriesScreen
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
      }))}
    />
  );
}
