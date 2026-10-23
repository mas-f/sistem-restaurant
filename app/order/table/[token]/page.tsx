import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MenuScreen } from "@/components/customer/menu-screen";
import { toMenuProduct } from "@/lib/menu";
import { prisma } from "@/lib/prisma";
import { resolveTableByToken } from "@/lib/resolve-table";

// Dinamis penuh (tanpa shell PPR): connection() + resolve token di level page,
// bukan di dalam Suspense — supaya notFound() untuk QR basi mengirim status
// 404 sungguhan, bukan shell 200 yang berisi konten 404.
export const instant = false;

export default async function TableOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await connection();
  const { token } = await params;
  // Token QR dari database; fallback mock menjaga tautan lama tetap terbuka.
  const table = await resolveTableByToken(token);

  if (!table) notFound();

  // Katalog tamu selalu dari database. Kategori kosong sengaja tetap tampil
  // (keputusan produk) agar struktur menu mengikuti data admin apa adanya.
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.product.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        categoryId: true,
        category: { select: { name: true, slug: true } },
      },
    }),
  ]);

  return (
    <MenuScreen
      tableCode={table.code}
      tableToken={table.sessionToken || table.code}
      seats={table.seats}
      guestLabel="Pesan langsung dari meja kamu — tanpa antre"
      categories={categories}
      products={products.map(toMenuProduct)}
    />
  );
}
