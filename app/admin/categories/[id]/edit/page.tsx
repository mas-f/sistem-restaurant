import { notFound } from "next/navigation";
import { CategoryFormScreen } from "@/components/admin/category-form-screen";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) notFound();

  return (
    <CategoryFormScreen
      category={{
        id: category.id,
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
      }}
    />
  );
}
