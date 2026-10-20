import { MenuListScreen } from "@/components/admin/menu-list-screen";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export const instant = false;

const PAGE_SIZE = 10;
const MAX_QUERY_LENGTH = 80;

interface MenuSearchParams {
  q?: string;
  cat?: string;
  page?: string;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<MenuSearchParams>;
}) {
  const sp = await searchParams;

  const q =
    typeof sp.q === "string" ? sp.q.trim().slice(0, MAX_QUERY_LENGTH) : "";
  const rawCat = typeof sp.cat === "string" ? sp.cat.trim() : "";

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  // Kategori asing dari URL diabaikan supaya filter tidak pernah menghasilkan
  // kombinasi yang mustahil.
  const cat = categories.some((category) => category.id === rawCat)
    ? rawCat
    : "";

  const where: Prisma.ProductWhereInput = {
    AND: [
      q ? { name: { contains: q, mode: "insensitive" } } : {},
      cat ? { categoryId: cat } : {},
    ],
  };

  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const rawPage = Number.parseInt(sp.page ?? "", 10);
  const page = Number.isFinite(rawPage)
    ? Math.min(Math.max(1, rawPage), totalPages)
    : 1;

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      category: { select: { name: true } },
    },
  });

  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <MenuListScreen
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        categoryName: product.category.name,
      }))}
      categories={categories}
      q={q}
      cat={cat}
      page={page}
      totalPages={totalPages}
      total={total}
      showingFrom={showingFrom}
      showingTo={showingTo}
    />
  );
}
