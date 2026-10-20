"use server"

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { isUserRole, ROLE_PATH } from "@/lib/auth-types";
import { removeProductImage } from "@/lib/supabase-storage";

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

    // Meja baru selalu tersedia; status dan sesi dikelola dari halaman meja.
    await prisma.diningTable.create({
      data: { code, seats, area, status: "available" },
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

    await prisma.diningTable.delete({ where: { id } });
  } catch (error) {
    console.error("[action] deleteTable gagal:", error);
    return { error: "Gagal menghapus meja. Coba lagi." };
  }

  revalidatePath("/admin/tables");
  return {};
};
