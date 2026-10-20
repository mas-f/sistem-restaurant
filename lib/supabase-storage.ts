import { StorageClient } from "@supabase/storage-js";

/**
 * Upload gambar produk ke Supabase Storage (browser-side).
 * Yang disimpan ke database hanyalah URL publik hasil upload — berkasnya tetap di bucket.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const PRODUCT_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET;

export const PRODUCT_IMAGE_MAX_BYTES = 3 * 1024 * 1024; // 3 MB
export const PRODUCT_IMAGE_MAX_LABEL = "3 MB";

/** Tipe berkas yang diterima → ekstensi berkas. */
export const PRODUCT_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const PRODUCT_IMAGE_ACCEPT = Object.keys(PRODUCT_IMAGE_TYPES).join(",");

let client: StorageClient | null = null;

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Konfigurasi ${name} belum diatur di .env.`);
  }
  return value;
}

function storageClient(): StorageClient {
  if (!client) {
    client = new StorageClient(
      `${requireEnv("NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL)}/storage/v1`,
      {
        apikey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", SUPABASE_ANON_KEY),
        Authorization: `Bearer ${requireEnv(
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          SUPABASE_ANON_KEY
        )}`,
      }
    );
  }
  return client;
}

function bucket(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_BUCKET", PRODUCT_BUCKET);
}

/** Validasi berkas sebelum upload. Mengembalikan pesan error, atau null jika lolos. */
export function validateProductImage(file: File): string | null {
  if (!PRODUCT_IMAGE_TYPES[file.type]) {
    return "Format gambar harus PNG, JPG, atau WEBP.";
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return `Ukuran gambar maksimal ${PRODUCT_IMAGE_MAX_LABEL}.`;
  }
  return null;
}

/**
 * Upload satu berkas ke `products/<uuid>.<ext>` dan kembalikan URL publiknya.
 * Melempar Error dengan pesan ramah pengguna bila gagal.
 */
export async function uploadProductImage(file: File): Promise<string> {
  const invalid = validateProductImage(file);
  if (invalid) throw new Error(invalid);

  const extension = PRODUCT_IMAGE_TYPES[file.type];
  const path = `products/${crypto.randomUUID()}.${extension}`;

  const { error } = await storageClient().from(bucket()).upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("[storage] upload gagal:", error.message);
    throw new Error(
      "Gagal mengunggah gambar ke penyimpanan. Periksa koneksi lalu coba lagi."
    );
  }

  const { data } = storageClient().from(bucket()).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Hapus berkas dari bucket berdasarkan URL publiknya. Best-effort:
 * URL di luar bucket kita diabaikan, kegagalan diamankan (tidak memicu error UI).
 */
export async function removeProductImage(publicUrl: string): Promise<void> {
  try {
    const base = SUPABASE_URL;
    const name = PRODUCT_BUCKET;
    if (!base || !name) return;

    const prefix = `${base}/storage/v1/object/public/${name}/`;
    if (!publicUrl.startsWith(prefix)) return;

    const path = decodeURIComponent(publicUrl.slice(prefix.length));
    if (!path) return;

    const { error } = await storageClient().from(name).remove([path]);
    if (error) console.error("[storage] hapus berkas gagal:", error.message);
  } catch (err) {
    console.error("[storage] hapus berkas gagal:", err);
  }
}
