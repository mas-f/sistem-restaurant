import { notFound } from "next/navigation";
import { RecipeScreen } from "@/components/admin/product/recipe-screen";
import { prisma } from "@/lib/prisma";
import { getProductRecipes } from "@/lib/recipe-queries";

export const instant = false;

export default async function ProductRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, ingredients, recipe] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        category: { select: { name: true } },
      },
    }),
    prisma.ingredient.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        unit: true,
        stock: true,
        costPerUnit: true,
        isActive: true,
      },
    }),
    getProductRecipes(id),
  ]);

  if (!product) notFound();

  return (
    <RecipeScreen
      product={{
        id: product.id,
        name: product.name,
        price: product.price,
        categoryName: product.category.name,
      }}
      ingredients={ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
        stock: Number(ingredient.stock),
        costPerUnit: ingredient.costPerUnit,
        isActive: ingredient.isActive,
      }))}
      initialLines={recipe.map((line) => ({
        ingredientId: line.ingredientId,
        quantity: String(line.quantity),
      }))}
    />
  );
}
