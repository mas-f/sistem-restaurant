"use server"

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isUserRole, ROLE_PATH, type UserRole } from "@/lib/auth-types";
import { removeProductImage } from "@/lib/supabase-storage";
import { stationForCategory } from "@/lib/menu";
import { isIngredientUnit } from "@/lib/inventory";
import type { IngredientUnit } from "@/lib/generated/prisma/enums";
import {
  makeOrderCode,
  toDbPaymentMethod,
  toDbStation,
} from "@/lib/order-utils";
import type { PaymentMethod } from "@/lib/types";

export const loginAction = async (_prevState: { error?: string }, formData: FormData): Promise<{ error?: string }> => {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Email dan kata sandi wajib diisi." };
  }

  let redirectTo = "/";

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    if (user && isUserRole(user.role)) {
      redirectTo = ROLE_PATH[user.role];
    }
  } catch {
    return { error: "Tidak dapat terhubung ke server. Coba lagi." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau password salah." };
    }

    throw error;
  }

  return {};
}

export const signOutAction = async () => {
  await signOut({ redirectTo: "/login" });
}

export interface CategoryFormState {
  error?: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

function parseCategoryForm(
  formData: FormData
): { name: string; slug: string; sortOrder: number } | { error: string } {
  const name = formData.get("name");
  const sortOrderRaw = formData.get("sortOrder");

  if (typeof name !== "string" || name.trim().length < 2) {
    return { error: "Nama kategori wajib diisi (min. 2 karakter)." };
  }

  const trimmedName = name.trim();
  const slug = slugify(trimmedName);

  if (!slug) {
    return { error: "Slug tidak valid. Gunakan huruf, angka, atau tanda minus." };
  }

  const sortOrder =
    typeof sortOrderRaw === "string" && sortOrderRaw.trim()
      ? Number.parseInt(sortOrderRaw, 10)
      : 0;

  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    return { error: "Urutan harus berupa angka 0 atau lebih." };
  }

  return { name: trimmedName, slug, sortOrder };
}

function readFormId(formData: FormData): string | null {
  const id = formData.get("id");
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

export const createCategoryAction = async (
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> => {
  const parsed = parseCategoryForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { name, slug, sortOrder } = parsed;

  try {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return { error: `Slug "${slug}" sudah dipakai kategori lain.` };
    }

    await prisma.category.create({
      data: { name, slug, sortOrder },
    });
  } catch {
    return { error: "Gagal menyimpan kategori. Coba lagi." };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
};

export const updateCategoryAction = async (
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> => {
  const id = readFormId(formData);
  if (!id) return { error: "Kategori tidak ditemukan." };

  const parsed = parseCategoryForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { name, slug, sortOrder } = parsed;

  try {
    const current = await prisma.category.findUnique({ where: { id } });
    if (!current) return { error: "Kategori tidak ditemukan." };

    if (slug !== current.slug) {
      const dup = await prisma.category.findUnique({ where: { slug } });
      if (dup && dup.id !== id) {
        return { error: `Slug "${slug}" sudah dipakai kategori lain.` };
      }
    }

    await prisma.category.update({
      where: { id },
      data: { name, slug, sortOrder },
    });
  } catch {
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
};

export const deleteCategoryAction = async (
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> => {
  const id = readFormId(formData);
  if (!id) return { error: "Kategori tidak ditemukan." };

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) return { error: "Kategori tidak ditemukan." };

    if (category._count.products > 0) {
      return {
        error: `Tidak bisa menghapus — masih ada ${category._count.products} produk di kategori ini.`,
      };
    }

    await prisma.category.delete({ where: { id } });
  } catch {
    return { error: "Gagal menghapus kategori. Coba lagi." };
  }

  revalidatePath("/admin/categories");
  redirect("/admin/categories");
};

export interface ProductFormState {
  error?: string;
}

function parseProductForm(
  formData: FormData
):
  | {
    name: string;
    description: string;
    categoryId: string;
    price: number;
    imageUrl: string;
  }
  | { error: string } {
  const name = formData.get("name");
  const description = formData.get("description");
  const categoryId = formData.get("categoryId");
  const priceRaw = formData.get("price");
  const imageUrl = formData.get("imageUrl");

  if (typeof name !== "string" || name.trim().length < 2) {
    return { error: "Nama produk wajib diisi (min. 2 karakter)." };
  }

  if (typeof description !== "string" || description.trim().length < 5) {
    return { error: "Deskripsi wajib diisi (min. 5 karakter)." };
  }

  if (typeof categoryId !== "string" || !categoryId.trim()) {
    return { error: "Kategori wajib dipilih." };
  }

  if (typeof priceRaw !== "string" || !/^\d+$/.test(priceRaw.trim())) {
    return { error: "Harga harus berupa angka. Isi bagian Harga terlebih dahulu." };
  }

  const price = Number.parseInt(priceRaw.trim(), 10);
  if (!Number.isSafeInteger(price) || price <= 0) {
    return { error: "Harga harus lebih dari 0." };
  }

  if (typeof imageUrl !== "string" || !imageUrl.trim()) {
    return { error: "Gambar produk wajib diunggah terlebih dahulu." };
  }

  return {
    name: name.trim(),
    description: description.trim(),
    categoryId: categoryId.trim(),
    price,
    imageUrl: imageUrl.trim(),
  };
}

/** Hanya URL publik milik bucket gambar produk kita yang boleh tersimpan. */
function isValidProductImageUrl(imageUrl: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET;

  if (!supabaseUrl || !bucket) return false;

  const prefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;
  return imageUrl.startsWith(prefix) && imageUrl.length > prefix.length;
}

export const createProductAction = async (
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> => {
  const parsed = parseProductForm(formData);
  if ("error" in parsed) return parsed;

  if (!isValidProductImageUrl(parsed.imageUrl)) {
    return { error: "Tautan gambar tidak valid. Unggah ulang gambar produk." };
  }

  const slug = slugify(parsed.name);
  if (!slug) {
    return { error: "Slug tidak valid. Gunakan huruf, angka, atau tanda minus." };
  }

  try {
    const [existingSlug, category] = await Promise.all([
      prisma.product.findUnique({ where: { slug } }),
      prisma.category.findUnique({ where: { id: parsed.categoryId } }),
    ]);

    if (!category) {
      return { error: "Kategori tidak ditemukan. Pilih kategori lain." };
    }

    if (existingSlug) {
      return { error: `Slug "${slug}" sudah dipakai produk lain.` };
    }

    await prisma.product.create({
      data: {
        name: parsed.name,
        slug,
        description: parsed.description,
        price: parsed.price,
        categoryId: parsed.categoryId,
        imageUrl: parsed.imageUrl,
      },
    });
  } catch (error) {
    console.error(error);
    return { error: "Gagal menyimpan produk. Coba lagi." };
  }

  revalidatePath("/admin/menu");
  redirect("/admin/menu");
};

export const updateProductAction = async (
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> => {
  const id = readFormId(formData);
  if (!id) return { error: "Produk tidak ditemukan." };

  const parsed = parseProductForm(formData);
  if ("error" in parsed) return parsed;

  if (!isValidProductImageUrl(parsed.imageUrl)) {
    return { error: "Tautan gambar tidak valid. Unggah ulang gambar produk." };
  }

  const slug = slugify(parsed.name);
  if (!slug) {
    return { error: "Slug tidak valid. Gunakan huruf, angka, atau tanda minus." };
  }

  let oldImageUrl: string | null = null;

  try {
    const [current, category] = await Promise.all([
      prisma.product.findUnique({ where: { id } }),
      prisma.category.findUnique({ where: { id: parsed.categoryId } }),
    ]);

    if (!current) return { error: "Produk tidak ditemukan." };

    if (!category) {
      return { error: "Kategori tidak ditemukan. Pilih kategori lain." };
    }

    // Slug tetap derived dari nama — dup hanya dicek bila slug berubah.
    if (slug !== current.slug) {
      const dup = await prisma.product.findUnique({ where: { slug } });
      if (dup && dup.id !== id) {
        return { error: `Slug "${slug}" sudah dipakai produk lain.` };
      }
    }

    oldImageUrl = current.imageUrl;

    await prisma.product.update({
      where: { id },
      data: {
        name: parsed.name,
        slug,
        description: parsed.description,
        price: parsed.price,
        categoryId: parsed.categoryId,
        imageUrl: parsed.imageUrl,
      },
    });
  } catch (error) {
    console.error("[action] updateProduct gagal:", error);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  // Berkas lama hanya dibuang bila URL benar-benar berubah, dan hanya setelah
  // update sukses — baris tidak pernah merujuk berkas yang sudah dihapus.
  if (oldImageUrl && oldImageUrl !== parsed.imageUrl) {
    await removeProductImage(oldImageUrl);
  }

  revalidatePath("/admin/menu");
  redirect("/admin/menu");
};

export interface ProductDeleteState {
  error?: string;
}

export const deleteProductAction = async (
  _prevState: ProductDeleteState,
  formData: FormData
): Promise<ProductDeleteState> => {
  const id = readFormId(formData);
  if (!id) return { error: "Produk tidak ditemukan." };

  let imageUrl: string | null = null;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    if (!product) return { error: "Produk tidak ditemukan." };

    imageUrl = product.imageUrl;
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    console.error("[action] deleteProduct gagal:", error);
    return { error: "Gagal menghapus produk. Coba lagi." };
  }

  if (imageUrl) await removeProductImage(imageUrl);

  revalidatePath("/admin/menu");
  return {};
};

export interface RecipeLineInput {
  ingredientId: string;
  quantity: number;
}

export interface RecipeFormState {
  error?: string;
  success?: boolean;
}

const RECIPE_MAX_LINES = 40;

/**
 * Menyimpan komposisi bahan satu produk (replace-all). Setiap menu wajib
 * punya minimal satu bahan agar pesanan bisa memotong stok secara akurat.
 */
export const saveProductRecipeAction = async (
  productId: string,
  items: RecipeLineInput[]
): Promise<RecipeFormState> => {
  if (!(await requireRole(["admin"]))) return { error: "Akses ditolak." };

  if (typeof productId !== "string" || !productId.trim()) {
    return { error: "Produk tidak ditemukan." };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Tambahkan minimal satu bahan untuk menu ini." };
  }

  if (items.length > RECIPE_MAX_LINES) {
    return { error: `Maksimal ${RECIPE_MAX_LINES} bahan per menu.` };
  }

  const seen = new Set<string>();
  const parsed: { ingredientId: string; quantity: Prisma.Decimal }[] = [];

  for (const item of items) {
    const ingredientId =
      typeof item?.ingredientId === "string" ? item.ingredientId.trim() : "";
    if (!ingredientId) return { error: "Ada baris bahan yang belum dipilih." };

    if (seen.has(ingredientId)) {
      return { error: "Bahan yang sama dipilih lebih dari sekali." };
    }
    seen.add(ingredientId);

    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { error: "Jumlah bahan harus lebih dari 0." };
    }
    if (quantity > STOCK_MAX) {
      return { error: "Jumlah bahan terlalu besar." };
    }
    if (Math.abs(quantity * 100 - Math.round(quantity * 100)) > 1e-6) {
      return { error: "Jumlah bahan maksimal 2 angka desimal." };
    }

    parsed.push({
      ingredientId,
      quantity: new Prisma.Decimal(quantity.toFixed(2)),
    });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) return { error: "Produk tidak ditemukan." };

    const ingredients = await prisma.ingredient.findMany({
      where: { id: { in: parsed.map((line) => line.ingredientId) } },
      select: { id: true, name: true, isActive: true },
    });

    if (ingredients.length !== parsed.length) {
      return { error: "Ada bahan yang sudah tidak terdaftar. Muat ulang halaman." };
    }

    const inactive = ingredients.find((ingredient) => !ingredient.isActive);
    if (inactive) {
      return {
        error: `Bahan "${inactive.name}" nonaktif — aktifkan dulu di inventaris.`,
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.recipeItem.deleteMany({ where: { productId } });
      await tx.recipeItem.createMany({
        data: parsed.map((line) => ({
          productId,
          ingredientId: line.ingredientId,
          quantity: line.quantity,
        })),
      });
    });
  } catch (error) {
    console.error("[action] saveProductRecipe gagal:", error);
    return { error: "Gagal menyimpan resep. Coba lagi." };
  }

  revalidatePath("/admin/menu");
  revalidatePath(`/admin/menu/${productId}/recipe`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");

  return { success: true };
};

export interface TableFormState {
  error?: string;
}

const TABLE_CODE_MAX = 10;
const TABLE_SEATS_MAX = 50;

function parseTableForm(
  formData: FormData
): { code: string; seats: number; area: string } | { error: string } {
  const code = formData.get("code");
  const seatsRaw = formData.get("seats");
  const area = formData.get("area");

  if (typeof code !== "string" || !code.trim()) {
    return { error: "Kode meja wajib diisi." };
  }

  // Kode meja sering diketik manual di kasir — seragamkan jadi huruf kapital.
  const trimmedCode = code.trim().toUpperCase();

  if (trimmedCode.length > TABLE_CODE_MAX) {
    return { error: `Kode meja maksimal ${TABLE_CODE_MAX} karakter.` };
  }

  if (typeof seatsRaw !== "string" || !/^\d+$/.test(seatsRaw.trim())) {
    return { error: "Kapasitas kursi harus berupa angka. Isi bagian Kapasitas Kursi terlebih dahulu." };
  }

  const seats = Number.parseInt(seatsRaw.trim(), 10);
  if (!Number.isSafeInteger(seats) || seats < 1 || seats > TABLE_SEATS_MAX) {
    return { error: `Kapasitas kursi harus antara 1 dan ${TABLE_SEATS_MAX}.` };
  }

  if (typeof area !== "string" || area.trim().length < 2) {
    return { error: "Area wajib diisi (min. 2 karakter)." };
  }

  return { code: trimmedCode, seats, area: area.trim() };
}

export const createTableAction = async (
  _prevState: TableFormState,
  formData: FormData
): Promise<TableFormState> => {
  const parsed = parseTableForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { code, seats, area } = parsed;

  try {
    const existing = await prisma.diningTable.findUnique({ where: { code } });
    if (existing) {
      return { error: `Kode meja "${code}" sudah dipakai meja lain.` };
    }

    // Meja baru selalu tersedia; status dikelola dari halaman meja. sessionToken
    // adalah identitas publik pada payload QR — dibuat sekali di sini dan tidak
    // berubah saat kode meja diganti, supaya QR yang sudah tercetak tetap sah.
    await prisma.diningTable.create({
      data: { code, seats, area, status: "available", sessionToken: crypto.randomUUID() },
    });
  } catch (error) {
    // Jaring kasus langka: kode dipakai di antara cek dan insert (unique constraint).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: `Kode meja "${code}" sudah dipakai meja lain.` };
    }
    console.error("[action] createTable gagal:", error);
    return { error: "Gagal menyimpan meja. Coba lagi." };
  }

  revalidatePath("/admin/tables");
  redirect("/admin/tables");
};

export const updateTableAction = async (
  _prevState: TableFormState,
  formData: FormData
): Promise<TableFormState> => {
  const id = readFormId(formData);
  if (!id) return { error: "Meja tidak ditemukan." };

  const parsed = parseTableForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { code, seats, area } = parsed;

  try {
    const current = await prisma.diningTable.findUnique({
      where: { id },
      select: { code: true, status: true },
    });
    if (!current) return { error: "Meja tidak ditemukan." };

    // Meja yang sedang dipakai tamu tidak boleh diubah — kode meja dipakai
    // oleh struk dan QR yang sudah tercetak.
    if (current.status === "occupied" || current.status === "waiting_payment") {
      return {
        error: `Meja ${current.code} sedang terisi — selesaikan sesinya dulu sebelum mengubah.`,
      };
    }

    // Kode unik hanya perlu dicek bila kode berubah; kalau tidak, meja akan
    // menemukan dirinya sendiri dan dianggap bentrok.
    if (code !== current.code) {
      const dup = await prisma.diningTable.findUnique({ where: { code } });
      if (dup && dup.id !== id) {
        return { error: `Kode meja "${code}" sudah dipakai meja lain.` };
      }
    }

    await prisma.diningTable.update({
      where: { id },
      data: { code, seats, area },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: `Kode meja "${code}" sudah dipakai meja lain.` };
    }
    console.error("[action] updateTable gagal:", error);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  revalidatePath("/admin/tables");
  redirect("/admin/tables");
};

export const deleteTableAction = async (
  _prevState: TableFormState,
  formData: FormData
): Promise<TableFormState> => {
  const id = readFormId(formData);
  if (!id) return { error: "Meja tidak ditemukan." };

  try {
    const table = await prisma.diningTable.findUnique({
      where: { id },
      select: { code: true, status: true },
    });
    if (!table) return { error: "Meja tidak ditemukan." };

    // Meja yang sedang dipakai tamu tidak boleh hilang begitu saja —
    // sesinya harus diselesaikan dulu lewat alur kasir.
    if (table.status === "occupied" || table.status === "waiting_payment") {
      return {
        error: `Meja ${table.code} sedang terisi — selesaikan sesinya dulu sebelum menghapus.`,
      };
    }

    // Riwayat sesi/order/payment tidak boleh ikut terhapus. Meja yang pernah
    // dipakai tetap disimpan agar struk dan laporan lama tidak kehilangan relasi.
    const sessionCount = await prisma.tableSession.count({
      where: { tableId: id },
    });
    if (sessionCount > 0) {
      return {
        error: `Meja ${table.code} punya riwayat sesi — meja tidak bisa dihapus.`,
      };
    }

    await prisma.diningTable.delete({ where: { id } });
  } catch (error) {
    console.error("[action] deleteTable gagal:", error);
    return { error: "Gagal menghapus meja. Coba lagi." };
  }

  revalidatePath("/admin/tables");
  return {};
};

// ---------------------------------------------------------------------------
// Order / table session / payment actions
// ---------------------------------------------------------------------------

class OrderActionError extends Error { }
class StockActionError extends Error { }

async function requireRole(roles: UserRole[]) {
  const session = await auth();
  const role = session?.user?.role;
  if (!role || !isUserRole(role) || !roles.includes(role)) return null;
  return session.user;
}

async function findTableByToken(raw: string) {
  const token = raw.trim();
  if (!token) return null;

  return prisma.diningTable.findFirst({
    where: {
      OR: [
        { sessionToken: token },
        { code: { equals: token, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      code: true,
      seats: true,
      status: true,
      sessionToken: true,
    },
  });
}

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
  note?: string;
}

export interface CreateOrderInput {
  tableToken: string;
  items: CreateOrderItemInput[];
}

export interface CreateOrderResult {
  error?: string;
  orderId?: string;
  code?: string;
}

const ORDER_ITEM_MAX = 50;
const ORDER_QTY_MAX = 99;
const ORDER_NOTE_MAX = 200;

function parseOrderItems(
  input: CreateOrderItemInput[] | undefined
): { items: { productId: string; quantity: number; note: string }[] } | { error: string } {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "Keranjang masih kosong." };
  }

  if (input.length > ORDER_ITEM_MAX) {
    return { error: `Maksimal ${ORDER_ITEM_MAX} item per pesanan.` };
  }

  const items: { productId: string; quantity: number; note: string }[] = [];

  for (const raw of input) {
    if (!raw || typeof raw.productId !== "string" || !raw.productId.trim()) {
      return { error: "Ada item pesanan yang tidak valid." };
    }

    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > ORDER_QTY_MAX) {
      return { error: `Jumlah item harus antara 1 dan ${ORDER_QTY_MAX}.` };
    }

    const note =
      typeof raw.note === "string"
        ? raw.note.trim().slice(0, ORDER_NOTE_MAX)
        : "";

    items.push({ productId: raw.productId.trim(), quantity, note });
  }

  return { items };
}

/**
 * Memotong stok bahan sesuai resep untuk satu pesanan.
 * - Produk tanpa resep ditolak (setiap menu wajib punya komposisi bahan).
 * - Stok kurang ditolak sebelum pesanan tersimpan.
 * - Setiap pemotongan menulis StockMovement `out` dalam transaksi yang sama.
 */
async function deductRecipeStock(
  tx: Prisma.TransactionClient,
  orderCode: string,
  ordered: { productId: string; productName: string; quantity: number }[],
  createdById: string | null
) {
  const qtyByProduct = new Map<string, number>();
  const nameByProduct = new Map<string, string>();

  for (const item of ordered) {
    qtyByProduct.set(
      item.productId,
      (qtyByProduct.get(item.productId) ?? 0) + item.quantity
    );
    nameByProduct.set(item.productId, item.productName);
  }

  const productIds = [...qtyByProduct.keys()];

  const rows = await tx.recipeItem.findMany({
    where: { productId: { in: productIds } },
    select: {
      productId: true,
      quantity: true,
      ingredient: {
        select: {
          id: true,
          name: true,
          unit: true,
          stock: true,
          isActive: true,
        },
      },
    },
  });

  const productsWithRecipe = new Set<string>();
  const requirements = new Map<
    string,
    {
      name: string;
      unit: string;
      required: Prisma.Decimal;
      stock: Prisma.Decimal;
      isActive: boolean;
    }
  >();

  for (const row of rows) {
    productsWithRecipe.add(row.productId);

    const factor = qtyByProduct.get(row.productId) ?? 0;
    if (factor <= 0) continue;

    const needed = new Prisma.Decimal(row.quantity).times(factor);
    const existing = requirements.get(row.ingredient.id);

    if (existing) {
      existing.required = existing.required.plus(needed);
    } else {
      requirements.set(row.ingredient.id, {
        name: row.ingredient.name,
        unit: row.ingredient.unit,
        required: needed,
        stock: new Prisma.Decimal(row.ingredient.stock),
        isActive: row.ingredient.isActive,
      });
    }
  }

  for (const productId of productIds) {
    if (!productsWithRecipe.has(productId)) {
      throw new OrderActionError(
        `Menu "${nameByProduct.get(productId) ?? "ini"}" belum punya resep bahan. Hubungi staf.`
      );
    }
  }

  // Urut stabil supaya dua pesanan bersamaan mengambil lock dengan urutan sama.
  const orderedRequirements = [...requirements.entries()].sort(([a], [b]) =>
    a.localeCompare(b)
  );

  for (const [ingredientId, need] of orderedRequirements) {
    if (!need.isActive) {
      throw new OrderActionError(
        `Bahan ${need.name} sedang dinonaktifkan. Hubungi staf.`
      );
    }

    if (need.stock.lt(need.required)) {
      throw new OrderActionError(
        `Stok ${need.name} tidak cukup untuk pesanan ini (tersisa ${need.stock.toFixed(
          2
        )} ${need.unit}).`
      );
    }

    const after = need.stock.minus(need.required);

    // Optimistic guard: hanya potong bila stok masih sama dengan yang dibaca.
    const updated = await tx.ingredient.updateMany({
      where: { id: ingredientId, stock: need.stock },
      data: { stock: after },
    });

    if (updated.count === 0) {
      throw new OrderActionError(
        "Stok berubah saat pesanan diproses. Kirim ulang pesanan."
      );
    }

    await tx.stockMovement.create({
      data: {
        ingredientId,
        type: "out",
        quantity: need.required.negated(),
        stockBefore: need.stock,
        stockAfter: after,
        note: `Pemakaian order ${orderCode}`,
        createdById,
      },
    });
  }
}

/**
 * Tamu mengirim pesanan dari keranjang. Harga dan subtotal selalu dihitung
 * ulang dari produk di database — input client hanya berisi productId,
 * quantity, dan catatan.
 */
export const createOrderAction = async (
  input: CreateOrderInput
): Promise<CreateOrderResult> => {
  const table = await findTableByToken(input?.tableToken ?? "");
  if (!table) {
    return { error: "Meja tidak ditemukan. Scan ulang QR di meja." };
  }

  if (table.status === "reserved" || table.status === "cleaning") {
    return { error: "Meja ini belum bisa menerima pesanan. Hubungi staf." };
  }

  if (table.status === "waiting_payment") {
    return { error: "Tagihan meja ini sudah diminta. Silakan hubungi kasir." };
  }

  const parsed = parseOrderItems(input?.items);
  if ("error" in parsed) return { error: parsed.error };

  const productIds = [...new Set(parsed.items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: { select: { name: true, slug: true } } },
  });

  if (products.length !== productIds.length) {
    return { error: "Ada produk yang sudah tidak tersedia. Muat ulang menu." };
  }

  const productById = new Map(products.map((product) => [product.id, product]));

  const items = parsed.items.map((item) => {
    const product = productById.get(item.productId)!;
    return {
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      station: toDbStation(stationForCategory(product.category)),
      note: item.note,
    };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const total = subtotal;
  const code = makeOrderCode("ORD");

  try {
    const order = await prisma.$transaction(async (tx) => {
      let session = await tx.tableSession.findFirst({
        where: { tableId: table.id, status: "open" },
        select: { id: true, billStatus: true },
      });

      if (
        session &&
        (session.billStatus === "requested" ||
          session.billStatus === "processing" ||
          session.billStatus === "paid")
      ) {
        throw new OrderActionError(
          "Tagihan meja ini sudah diminta. Silakan hubungi kasir."
        );
      }

      if (!session) {
        session = await tx.tableSession.create({
          data: { tableId: table.id, guests: 1, status: "open" },
          select: { id: true, billStatus: true },
        });
      }

      await tx.diningTable.update({
        where: { id: table.id },
        data: { status: "occupied" },
      });

      const created = await tx.order.create({
        data: {
          code,
          sessionId: session.id,
          tableCode: table.code,
          subtotal,
          total,
          items: { create: items },
        },
        select: { id: true, code: true },
      });

      // Stok bahan dipotong dalam transaksi yang sama: pesanan tidak pernah
      // tersimpan tanpa jejak pemakaian bahan.
      await deductRecipeStock(
        tx,
        created.code,
        items.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
        })),
        null
      );

      return created;
    });

    revalidatePath("/staff/kitchen");
    revalidatePath("/staff/cashier");
    revalidatePath("/staff/orders");
    revalidatePath("/admin/orders");

    return { orderId: order.id, code: order.code };
  } catch (error) {
    if (error instanceof OrderActionError) {
      return { error: error.message };
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Pesanan lain sedang diproses. Coba kirim sekali lagi." };
    }

    console.error("[action] createOrder gagal:", error);
    return { error: "Gagal membuat pesanan. Coba lagi." };
  }
};

export const openTableAction = async (
  tableId: string
): Promise<{ error?: string }> => {
  const user = await requireRole(["cashier", "admin"]);
  if (!user) return { error: "Akses ditolak." };

  const table = await prisma.diningTable.findUnique({
    where: { id: tableId },
    select: { id: true, code: true, status: true },
  });

  if (!table) return { error: "Meja tidak ditemukan." };
  if (table.status === "occupied" || table.status === "waiting_payment") {
    return { error: `Meja ${table.code} sudah memiliki sesi aktif.` };
  }

  const existing = await prisma.tableSession.findFirst({
    where: { tableId: table.id, status: "open" },
    select: { id: true },
  });
  if (existing) {
    return { error: `Meja ${table.code} sudah memiliki sesi aktif.` };
  }

  try {
    await prisma.$transaction([
      prisma.tableSession.create({
        data: { tableId: table.id, guests: 1, status: "open" },
      }),
      prisma.diningTable.update({
        where: { id: table.id },
        data: { status: "occupied" },
      }),
    ]);
  } catch (error) {
    console.error("[action] openTable gagal:", error);
    return { error: "Gagal membuka sesi meja. Coba lagi." };
  }

  revalidatePath("/staff/cashier");
  return {};
};

export const advanceKitchenAction = async (
  orderId: string
): Promise<{ error?: string }> => {
  const user = await requireRole(["kitchen", "admin"]);
  if (!user) return { error: "Akses ditolak." };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, kitchenStatus: true, status: true, tableCode: true },
  });

  if (!order) return { error: "Order tidak ditemukan." };
  if (order.status === "cancelled" || order.status === "completed") {
    return { error: `Order meja ${order.tableCode} sudah selesai.` };
  }

  const next: Record<
    "new" | "accepted" | "preparing" | "ready",
    {
      kitchenStatus: "new" | "accepted" | "preparing" | "ready";
      status: "pending" | "confirmed" | "preparing" | "ready" | "completed";
    }
  > = {
    new: { kitchenStatus: "accepted", status: "confirmed" },
    accepted: { kitchenStatus: "preparing", status: "preparing" },
    preparing: { kitchenStatus: "ready", status: "ready" },
    ready: { kitchenStatus: "ready", status: "completed" },
  };

  await prisma.order.update({
    where: { id: order.id },
    data: next[order.kitchenStatus],
  });

  revalidatePath("/staff/kitchen");
  revalidatePath("/staff/cashier");
  revalidatePath("/staff/orders");
  revalidatePath("/admin/orders");
  return {};
};

export interface PayOrdersInput {
  tableId: string;
  orderIds: string[];
  method: PaymentMethod;
  amountReceived?: number | null;
}

export interface PayOrdersResult {
  error?: string;
  paymentId?: string;
  code?: string;
  total?: number;
  amountReceived?: number | null;
  change?: number | null;
  orderCodes?: string[];
  sessionClosed?: boolean;
}

class PaymentActionError extends Error { }

const PAYMENT_METHODS: PaymentMethod[] = ["QRIS", "CASH"];

export const payOrdersAction = async (
  input: PayOrdersInput
): Promise<PayOrdersResult> => {
  const user = await requireRole(["cashier", "admin"]);
  if (!user) return { error: "Akses ditolak." };

  if (!input || !PAYMENT_METHODS.includes(input.method)) {
    return { error: "Metode pembayaran tidak valid." };
  }

  const orderIds = [
    ...new Set(
      Array.isArray(input.orderIds)
        ? input.orderIds.filter(
          (id): id is string => typeof id === "string" && id.length > 0
        )
        : []
    ),
  ];

  if (orderIds.length === 0) {
    return { error: "Pilih minimal satu order untuk dibayar." };
  }
  if (orderIds.length > 100) {
    return { error: "Terlalu banyak order dalam satu pembayaran." };
  }

  const table = await prisma.diningTable.findUnique({
    where: { id: input.tableId },
    select: { id: true, code: true },
  });
  if (!table) return { error: "Meja tidak ditemukan." };

  const code = makeOrderCode("PAY");

  try {
    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.tableSession.findFirst({
        where: { tableId: table.id, status: "open" },
        select: { id: true },
      });

      if (!session) {
        throw new PaymentActionError("Tidak ada sesi aktif di meja ini.");
      }

      const selectedOrders = await tx.order.findMany({
        where: {
          id: { in: orderIds },
          sessionId: session.id,
          paymentId: null,
          status: { not: "cancelled" },
        },
        select: { id: true, code: true, total: true },
      });

      if (selectedOrders.length !== orderIds.length) {
        throw new PaymentActionError(
          "Sebagian order sudah dibayar atau tidak lagi tersedia. Muat ulang halaman."
        );
      }

      const total = selectedOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );
      const isCash = input.method === "CASH";
      const received = isCash ? Number(input.amountReceived) : null;

      if (isCash) {
        if (!Number.isInteger(received) || received === null || received < 0) {
          throw new PaymentActionError("Uang diterima tidak valid.");
        }
        if (received < total) {
          throw new PaymentActionError(
            "Uang diterima kurang dari total order yang dipilih."
          );
        }
      }

      const change = isCash && received !== null ? received - total : null;

      const payment = await tx.payment.create({
        data: {
          code,
          sessionId: session.id,
          amount: total,
          method: toDbPaymentMethod(input.method),
          status: "paid",
          amountReceived: isCash ? received : null,
          change,
          cashierId: user.id,
          paidAt: new Date(),
        },
        select: { id: true },
      });

      // Conditional update mencegah dua kasir membayar order yang sama.
      const updated = await tx.order.updateMany({
        where: {
          id: { in: orderIds },
          sessionId: session.id,
          paymentId: null,
          status: { not: "cancelled" },
        },
        data: { paymentId: payment.id },
      });

      if (updated.count !== orderIds.length) {
        throw new PaymentActionError(
          "Order berubah saat pembayaran diproses. Muat ulang halaman."
        );
      }

      const remaining = await tx.order.count({
        where: {
          sessionId: session.id,
          paymentId: null,
          status: { not: "cancelled" },
        },
      });

      const sessionClosed = remaining === 0;

      if (sessionClosed) {
        await tx.tableSession.update({
          where: { id: session.id },
          data: { status: "closed", billStatus: "paid", closedAt: new Date() },
        });
        await tx.diningTable.update({
          where: { id: table.id },
          data: { status: "available" },
        });
      }

      return {
        paymentId: payment.id,
        total,
        amountReceived: isCash ? received : null,
        change,
        orderCodes: selectedOrders.map((order) => order.code),
        sessionClosed,
      };
    });

    revalidatePath("/staff/cashier");
    revalidatePath("/staff/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/payments");
    return { code, ...result };
  } catch (error) {
    if (error instanceof PaymentActionError) {
      return { error: error.message };
    }

    console.error("[action] payOrders gagal:", error);
    return { error: "Gagal memproses pembayaran. Coba lagi." };
  }
};

// ---------------------------------------------------------------------------
// Inventory (bahan baku) & supplier actions
// ---------------------------------------------------------------------------

export interface IngredientFormState {
  error?: string;
}

export interface SupplierFormState {
  error?: string;
}

export interface AdjustStockResult {
  error?: string;
  stockAfter?: number;
}

export type AdjustStockInput =
  | {
    ingredientId: string;
    type: "in" | "out";
    quantity: number;
    note?: string;
  }
  | {
    ingredientId: string;
    type: "adjustment";
    targetStock: number;
    note?: string;
  };

const STOCK_MAX = 9_999_999.99;
const INGREDIENT_NAME_MAX = 80;
const INGREDIENT_COST_MAX = 100_000_000;
const STOCK_NOTE_MAX = 200;

function parseStockDecimal(
  raw: FormDataEntryValue | null,
  label: string
): { value: string } | { error: string } {
  if (typeof raw !== "string" || !raw.trim()) {
    return { error: `${label} wajib diisi.` };
  }

  const normalized = raw.trim().replace(",", ".");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return { error: `${label} harus berupa angka (maksimal 2 desimal).` };
  }

  if (Number(normalized) > STOCK_MAX) {
    return { error: `${label} terlalu besar.` };
  }

  return { value: normalized };
}

/** Angka dari input client (bukan FormData) — dipakai dialog mutasi stok. */
function normalizeStockNumber(value: unknown): number | null {
  const raw =
    typeof value === "number"
      ? String(value)
      : typeof value === "string"
        ? value.trim().replace(",", ".")
        : "";

  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) return null;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed > STOCK_MAX) return null;

  return parsed;
}

/**
 * @param fallbackUnit Satuan yang sudah tersimpan. Dipakai saat update: field
 *   satuan bisa saja tidak ikut terkirim (mis. kontrol read-only + hidden
 *   input), dan nilai lama harus dipertahankan, bukan ditolak.
 */
function parseIngredientForm(
  formData: FormData,
  includeStock: boolean,
  fallbackUnit?: IngredientUnit
):
  | {
    name: string;
    unit: IngredientUnit;
    stock: string | null;
    minStock: string;
    costPerUnit: number;
    supplierId: string | null;
    isActive: boolean;
  }
  | { error: string } {
  const nameRaw = formData.get("name");
  const unitRaw = formData.get("unit");
  const supplierRaw = formData.get("supplierId");
  const costRaw = formData.get("costPerUnit");

  if (typeof nameRaw !== "string" || nameRaw.trim().length < 2) {
    return { error: "Nama bahan wajib diisi (min. 2 karakter)." };
  }

  const name = nameRaw.trim();
  if (name.length > INGREDIENT_NAME_MAX) {
    return { error: `Nama bahan maksimal ${INGREDIENT_NAME_MAX} karakter.` };
  }

  // Saat update, field satuan bisa tidak terkirim (kontrol read-only).
  // Nilai tersimpan menjadi acuan agar perubahan lain tetap bisa disimpan.
  const unitValue =
    typeof unitRaw === "string" && unitRaw.trim()
      ? unitRaw.trim()
      : fallbackUnit;

  if (!unitValue || !isIngredientUnit(unitValue)) {
    return { error: "Satuan wajib dipilih." };
  }

  const minStock = parseStockDecimal(formData.get("minStock"), "Stok minimum");
  if ("error" in minStock) return { error: minStock.error };

  let stock: string | null = null;
  if (includeStock) {
    const parsedStock = parseStockDecimal(formData.get("stock"), "Stok awal");
    if ("error" in parsedStock) return { error: parsedStock.error };
    stock = parsedStock.value;
  }

  if (typeof costRaw !== "string" || !/^\d+$/.test(costRaw.trim())) {
    return { error: "Harga satuan harus berupa angka. Isi bagian Harga Satuan terlebih dahulu." };
  }

  const costPerUnit = Number.parseInt(costRaw.trim(), 10);
  if (
    !Number.isSafeInteger(costPerUnit) ||
    costPerUnit < 0 ||
    costPerUnit > INGREDIENT_COST_MAX
  ) {
    return { error: "Harga satuan tidak valid." };
  }

  const supplierId =
    typeof supplierRaw === "string" && supplierRaw.trim()
      ? supplierRaw.trim()
      : null;

  const isActive = formData.get("isActive") !== "false";

  return {
    name,
    unit: unitValue,
    stock,
    minStock: minStock.value,
    costPerUnit,
    supplierId,
    isActive,
  };
}

async function findIngredientNameConflict(name: string, excludeId?: string) {
  return prisma.ingredient.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
}

async function assertSupplierExists(supplierId: string | null) {
  if (!supplierId) return null;

  return prisma.supplier.findUnique({
    where: { id: supplierId },
    select: { id: true },
  });
}

export const createIngredientAction = async (
  _prevState: IngredientFormState,
  formData: FormData
): Promise<IngredientFormState> => {
  const user = await requireRole(["admin"]);
  if (!user) return { error: "Akses ditolak." };

  const parsed = parseIngredientForm(formData, true);
  if ("error" in parsed) return { error: parsed.error };

  try {
    const [conflict, supplier] = await Promise.all([
      findIngredientNameConflict(parsed.name),
      assertSupplierExists(parsed.supplierId),
    ]);

    if (conflict) {
      return { error: `Bahan "${parsed.name}" sudah terdaftar.` };
    }
    if (parsed.supplierId && !supplier) {
      return { error: "Supplier tidak ditemukan. Pilih supplier lain." };
    }

    const openingStock = new Prisma.Decimal(parsed.stock ?? "0");

    await prisma.$transaction(async (tx) => {
      const ingredient = await tx.ingredient.create({
        data: {
          name: parsed.name,
          unit: parsed.unit,
          stock: openingStock,
          minStock: new Prisma.Decimal(parsed.minStock),
          costPerUnit: parsed.costPerUnit,
          supplierId: parsed.supplierId,
        },
        select: { id: true },
      });

      // Stok awal tetap punya jejak audit — bukan angka yang muncul diam-diam.
      if (openingStock.gt(0)) {
        await tx.stockMovement.create({
          data: {
            ingredientId: ingredient.id,
            type: "in",
            quantity: openingStock,
            stockBefore: new Prisma.Decimal(0),
            stockAfter: openingStock,
            note: "Stok awal",
            createdById: user.id,
          },
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: `Bahan "${parsed.name}" sudah terdaftar.` };
    }
    console.error("[action] createIngredient gagal:", error);
    return { error: "Gagal menyimpan bahan. Coba lagi." };
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  redirect("/admin/inventory");
};

export const updateIngredientAction = async (
  _prevState: IngredientFormState,
  formData: FormData
): Promise<IngredientFormState> => {
  if (!(await requireRole(["admin"]))) return { error: "Akses ditolak." };

  const id = readFormId(formData);
  if (!id) return { error: "Bahan tidak ditemukan." };

  let current: {
    id: string;
    unit: IngredientUnit;
    isActive: boolean;
  } | null = null;

  try {
    current = await prisma.ingredient.findUnique({
      where: { id },
      select: { id: true, unit: true, isActive: true },
    });
  } catch (error) {
    console.error("[action] updateIngredient gagal:", error);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  if (!current) return { error: "Bahan tidak ditemukan." };

  // Satuan tersimpan dipakai bila form tidak mengirim field satuan (kontrol
  // read-only untuk bahan yang sudah punya riwayat stok).
  const parsed = parseIngredientForm(formData, false, current.unit);
  if ("error" in parsed) return { error: parsed.error };

  try {
    const [conflict, supplier] = await Promise.all([
      findIngredientNameConflict(parsed.name, id),
      assertSupplierExists(parsed.supplierId),
    ]);

    if (conflict) {
      return { error: `Bahan "${parsed.name}" sudah terdaftar.` };
    }
    if (parsed.supplierId && !supplier) {
      return { error: "Supplier tidak ditemukan. Pilih supplier lain." };
    }

    // Satuan tidak boleh berubah setelah ada riwayat — angka lama akan
    // salah tafsir bila kg berubah menjadi liter.
    if (parsed.unit !== current.unit) {
      const [movementCount, recipeCount] = await Promise.all([
        prisma.stockMovement.count({ where: { ingredientId: id } }),
        prisma.recipeItem.count({ where: { ingredientId: id } }),
      ]);

      if (recipeCount > 0) {
        return {
          error: `Satuan tidak bisa diubah karena bahan ini dipakai di ${recipeCount} resep menu.`,
        };
      }

      if (movementCount > 0) {
        return {
          error:
            "Satuan tidak bisa diubah karena bahan ini sudah punya riwayat stok.",
        };
      }
    }

    // Menonaktifkan bahan yang masih dipakai resep akan mematikan menu terkait.
    if (current.isActive && !parsed.isActive) {
      const recipeCount = await prisma.recipeItem.count({
        where: { ingredientId: id },
      });
      if (recipeCount > 0) {
        return {
          error: `Bahan ini dipakai di ${recipeCount} resep menu — lepas dulu dari resep sebelum menonaktifkan.`,
        };
      }
    }

    await prisma.ingredient.update({
      where: { id },
      data: {
        name: parsed.name,
        unit: parsed.unit,
        minStock: new Prisma.Decimal(parsed.minStock),
        costPerUnit: parsed.costPerUnit,
        supplierId: parsed.supplierId,
        isActive: parsed.isActive,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: `Bahan "${parsed.name}" sudah terdaftar.` };
    }
    console.error("[action] updateIngredient gagal:", error);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${id}`);
  revalidatePath("/admin");
  redirect(`/admin/inventory/${id}`);
};

export const setIngredientActiveAction = async (
  ingredientId: string,
  isActive: boolean
): Promise<{ error?: string }> => {
  if (!(await requireRole(["admin"]))) return { error: "Akses ditolak." };

  if (!ingredientId) return { error: "Bahan tidak ditemukan." };

  if (!isActive) {
    const recipeCount = await prisma.recipeItem.count({
      where: { ingredientId },
    });
    if (recipeCount > 0) {
      return {
        error: `Bahan ini dipakai di ${recipeCount} resep menu — lepas dulu dari resep sebelum menonaktifkan.`,
      };
    }
  }

  try {
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: { isActive },
    });
  } catch (error) {
    console.error("[action] setIngredientActive gagal:", error);
    return { error: "Gagal memperbarui status bahan. Coba lagi." };
  }

  revalidatePath("/admin/inventory");
  revalidatePath(`/admin/inventory/${ingredientId}`);
  revalidatePath("/admin");
  return {};
};

export const adjustStockAction = async (
  input: AdjustStockInput
): Promise<AdjustStockResult> => {
  const user = await requireRole(["admin"]);
  if (!user) return { error: "Akses ditolak." };

  if (!input || typeof input.ingredientId !== "string" || !input.ingredientId) {
    return { error: "Bahan tidak ditemukan." };
  }

  const note =
    typeof input.note === "string"
      ? input.note.trim().slice(0, STOCK_NOTE_MAX)
      : "";

  const requested =
    input.type === "adjustment"
      ? normalizeStockNumber(input.targetStock)
      : normalizeStockNumber(input.quantity);

  if (requested === null) {
    return {
      error:
        input.type === "adjustment"
          ? "Stok hasil hitung tidak valid."
          : "Jumlah harus berupa angka lebih dari 0 (maksimal 2 desimal).",
    };
  }

  if (input.type !== "adjustment" && requested <= 0) {
    return { error: "Jumlah harus lebih dari 0." };
  }

  try {
    const stockAfter = await prisma.$transaction(async (tx) => {
      const ingredient = await tx.ingredient.findUnique({
        where: { id: input.ingredientId },
        select: { id: true, name: true, unit: true, stock: true },
      });

      if (!ingredient) throw new StockActionError("Bahan tidak ditemukan.");

      const before = new Prisma.Decimal(ingredient.stock);
      const amount = new Prisma.Decimal(requested);
      let after: Prisma.Decimal;

      if (input.type === "in") {
        after = before.plus(amount);
      } else if (input.type === "out") {
        if (before.lt(amount)) {
          throw new StockActionError(
            `Stok tidak cukup. Tersisa ${before.toFixed(2)} ${ingredient.unit}.`
          );
        }
        after = before.minus(amount);
      } else {
        after = amount;
        if (after.equals(before)) {
          throw new StockActionError(
            "Stok hasil hitung sama dengan stok saat ini — tidak ada perubahan."
          );
        }
      }

      // Optimistic lock: dua tab yang menyimpan bersamaan tidak boleh saling
      // menimpa. Hanya update bila stok masih sama dengan yang dibaca.
      const updated = await tx.ingredient.updateMany({
        where: { id: ingredient.id, stock: before },
        data: { stock: after },
      });

      if (updated.count === 0) {
        throw new StockActionError(
          "Stok berubah saat diproses. Muat ulang halaman lalu coba lagi."
        );
      }

      await tx.stockMovement.create({
        data: {
          ingredientId: ingredient.id,
          type: input.type,
          quantity: after.minus(before),
          stockBefore: before,
          stockAfter: after,
          note,
          createdById: user.id,
        },
      });

      return after.toNumber();
    });

    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/inventory/${input.ingredientId}`);
    revalidatePath("/admin");
    return { stockAfter };
  } catch (error) {
    if (error instanceof StockActionError) {
      return { error: error.message };
    }
    console.error("[action] adjustStock gagal:", error);
    return { error: "Gagal memperbarui stok. Coba lagi." };
  }
};

export const deleteIngredientAction = async (
  _prevState: IngredientFormState,
  formData: FormData
): Promise<IngredientFormState> => {
  if (!(await requireRole(["admin"]))) return { error: "Akses ditolak." };

  const id = readFormId(formData);
  if (!id) return { error: "Bahan tidak ditemukan." };

  try {
    const ingredient = await prisma.ingredient.findUnique({
      where: { id },
      select: {
        name: true,
        _count: { select: { movements: true, recipes: true } },
      },
    });
    if (!ingredient) return { error: "Bahan tidak ditemukan." };

    // Resep menu tidak boleh menunjuk bahan yang hilang.
    if (ingredient._count.recipes > 0) {
      return {
        error: `Bahan "${ingredient.name}" dipakai di ${ingredient._count.recipes} resep menu — lepas dulu dari resep sebelum menghapus.`,
      };
    }

    // Riwayat stok tidak boleh hilang. Bahan yang pernah dipakai cukup
    // dinonaktifkan agar laporan lama tetap utuh.
    if (ingredient._count.movements > 0) {
      return {
        error: `Bahan "${ingredient.name}" punya riwayat stok — nonaktifkan saja, tidak bisa dihapus permanen.`,
      };
    }

    await prisma.ingredient.delete({ where: { id } });
  } catch (error) {
    console.error("[action] deleteIngredient gagal:", error);
    return { error: "Gagal menghapus bahan. Coba lagi." };
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  redirect("/admin/inventory");
};

function parseSupplierForm(
  formData: FormData
):
  | {
    name: string;
    contact: string;
    phone: string;
    email: string;
    address: string;
    isActive: boolean;
  }
  | { error: string } {
  const name = formData.get("name");
  const contact = formData.get("contact");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const address = formData.get("address");

  if (typeof name !== "string" || name.trim().length < 2) {
    return { error: "Nama supplier wajib diisi (min. 2 karakter)." };
  }

  const trimmedName = name.trim();
  if (trimmedName.length > 80) {
    return { error: "Nama supplier maksimal 80 karakter." };
  }

  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { error: "Format email supplier tidak valid." };
  }

  return {
    name: trimmedName,
    contact: typeof contact === "string" ? contact.trim().slice(0, 80) : "",
    phone: typeof phone === "string" ? phone.trim().slice(0, 30) : "",
    email: trimmedEmail.slice(0, 120),
    address: typeof address === "string" ? address.trim().slice(0, 200) : "",
    isActive: formData.get("isActive") !== "false",
  };
}

async function findSupplierNameConflict(name: string, excludeId?: string) {
  return prisma.supplier.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true },
  });
}

export const createSupplierAction = async (
  _prevState: SupplierFormState,
  formData: FormData
): Promise<SupplierFormState> => {
  if (!(await requireRole(["admin"]))) return { error: "Akses ditolak." };

  const parsed = parseSupplierForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  try {
    const conflict = await findSupplierNameConflict(parsed.name);
    if (conflict) return { error: `Supplier "${parsed.name}" sudah terdaftar.` };

    await prisma.supplier.create({ data: parsed });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: `Supplier "${parsed.name}" sudah terdaftar.` };
    }
    console.error("[action] createSupplier gagal:", error);
    return { error: "Gagal menyimpan supplier. Coba lagi." };
  }

  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/inventory");
  redirect("/admin/suppliers");
};

export const updateSupplierAction = async (
  _prevState: SupplierFormState,
  formData: FormData
): Promise<SupplierFormState> => {
  if (!(await requireRole(["admin"]))) return { error: "Akses ditolak." };

  const id = readFormId(formData);
  if (!id) return { error: "Supplier tidak ditemukan." };

  const parsed = parseSupplierForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  try {
    const current = await prisma.supplier.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!current) return { error: "Supplier tidak ditemukan." };

    const conflict = await findSupplierNameConflict(parsed.name, id);
    if (conflict) return { error: `Supplier "${parsed.name}" sudah terdaftar.` };

    await prisma.supplier.update({ where: { id }, data: parsed });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: `Supplier "${parsed.name}" sudah terdaftar.` };
    }
    console.error("[action] updateSupplier gagal:", error);
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/inventory");
  redirect("/admin/suppliers");
};

export const deleteSupplierAction = async (
  _prevState: SupplierFormState,
  formData: FormData
): Promise<SupplierFormState> => {
  if (!(await requireRole(["admin"]))) return { error: "Akses ditolak." };

  const id = readFormId(formData);
  if (!id) return { error: "Supplier tidak ditemukan." };

  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      select: { name: true, _count: { select: { ingredients: true } } },
    });
    if (!supplier) return { error: "Supplier tidak ditemukan." };

    if (supplier._count.ingredients > 0) {
      return {
        error: `Supplier "${supplier.name}" masih dipakai ${supplier._count.ingredients} bahan — pindahkan bahannya dulu.`,
      };
    }

    await prisma.supplier.delete({ where: { id } });
  } catch (error) {
    console.error("[action] deleteSupplier gagal:", error);
    return { error: "Gagal menghapus supplier. Coba lagi." };
  }

  revalidatePath("/admin/suppliers");
  revalidatePath("/admin/inventory");
  redirect("/admin/suppliers");
};
