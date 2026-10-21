import type { MenuProduct, MenuStation } from "@/lib/types";

/** Tab sintetis "Semua" — tidak pernah bertabrakan dengan id UUID dari DB. */
export const ALL_CATEGORY_ID = "all";

export interface MenuProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  category: {
    name: string;
    slug: string;
  };
}

// Schema belum punya kolom stasiun, jadi stasiun diturunkan dari kategori.
// Pemetaan ini hanya untuk alur kitchen mock; bila nanti ada kolom `station`
// di database, ganti helper ini dengan nilai dari baris produk.
const STATION_RULES: { tokens: string[]; station: MenuStation }[] = [
  {
    tokens: ["minuman", "kopi", "teh", "jus", "juice", "buah", "bar", "drink"],
    station: "Bar",
  },
  {
    tokens: ["mie", "bakmi", "soto", "wok", "noodle"],
    station: "Wok",
  },
];

export function stationForCategory(category: {
  name: string;
  slug: string;
}): MenuStation {
  const haystack = `${category.slug} ${category.name}`.toLowerCase();
  const match = STATION_RULES.find((rule) =>
    rule.tokens.some((token) => haystack.includes(token))
  );

  return match?.station ?? "Grill";
}

/** Baris Prisma → props serializable untuk komponen menu tamu. */
export function toMenuProduct(row: MenuProductRow): MenuProduct {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    imageUrl: row.imageUrl,
    categoryId: row.categoryId,
    station: stationForCategory(row.category),
  };
}
