"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, CircleAlert, ImagePlus, Info, Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProductAction, updateProductAction } from "@/lib/action";
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_LABEL,
  removeProductImage,
  uploadProductImage,
  validateProductImage,
} from "@/lib/supabase-storage";
import { cn } from "@/lib/utils";

export interface CategoryOption {
  id: string;
  name: string;
}

export interface ProductFormData {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  price: number;
  imageUrl: string;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatRupiah = (digits: string) =>
  digits ? Number(digits).toLocaleString("id-ID") : "";

const DESCRIPTION_MAX = 400;

export function ProductFormScreen({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: ProductFormData;
}) {
  const [state, formAction, pending] = useActionState(
    product ? updateProductAction : createProductAction,
    {}
  );

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [priceDigits, setPriceDigits] = useState(
    product ? String(product.price) : ""
  );

  // Di mode edit, gambar yang sudah ada di database langsung dijadikan
  // pratinjau sekaligus nilai awal imageUrl.
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    product?.imageUrl ?? null
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    product?.imageUrl ?? null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const publicUrlRef = useRef<string | null>(product?.imageUrl ?? null);
  // Berkas milik database tidak boleh disentuh cleanup klien — hanya file
  // yang di-upload di sesi ini yang boleh dibuang saat ganti/hapus/Batal.
  const originalUrlRef = useRef<string | null>(product?.imageUrl ?? null);
  const uploadTokenRef = useRef(0);

  const previewSlug = slugify(name);
  const hasCategories = categories.length > 0;
  const canSubmit =
    hasCategories && Boolean(imageUrl) && !uploading && !pending;

  // object URL hanya hidup selama komponen ini — lepas saat unmount.
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const setPublicUrl = (url: string | null) => {
    publicUrlRef.current = url;
    setImageUrl(url);
  };

  /** Buang berkas yang sudah terupload dari bucket (dipakai saat ganti/hapus/Batal). */
  const discardUpload = () => {
    const previousUrl = publicUrlRef.current;
    setPublicUrl(null);
    // Berkas lama dari database hanya dihapus server-side oleh updateProductAction.
    if (previousUrl && previousUrl !== originalUrlRef.current) {
      void removeProductImage(previousUrl);
    }
  };

  const handleFile = async (file: File | null | undefined) => {
    if (!file) return;

    const invalid = validateProductImage(file);
    if (invalid) {
      setUploadError(invalid);
      return;
    }

    const token = ++uploadTokenRef.current;

    // Pratinjau langsung dari berkas terpilih — tidak menunggu upload selesai.
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const blob = URL.createObjectURL(file);
    blobUrlRef.current = blob;
    setPreviewUrl(blob);
    setFileName(file.name);
    setUploadError(null);

    discardUpload();
    setUploading(true);

    try {
      const uploadedUrl = await uploadProductImage(file);
      if (token !== uploadTokenRef.current) {
        // Pengguna sudah memilih berkas lain / menghapus — jangan biarkan yatim.
        void removeProductImage(uploadedUrl);
        return;
      }
      setPublicUrl(uploadedUrl);
    } catch (err) {
      if (token !== uploadTokenRef.current) return;
      console.error("[product-form] upload:", err);
      setUploadError(
        err instanceof Error ? err.message : "Gagal mengunggah gambar. Coba lagi."
      );
    } finally {
      if (token === uploadTokenRef.current) setUploading(false);
    }
  };

  const clearImage = () => {
    uploadTokenRef.current += 1; // hasil upload yang masih menerbang akan dibuang saat selesai

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPreviewUrl(null);
    setFileName(null);
    setUploadError(null);
    setDragging(false);
    setUploading(false);
    discardUpload();

    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-balance">
          {product ? "Edit Produk" : "Tambah Produk"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {product
            ? "Perbarui detail menu. Slug otomatis mengikuti nama, dan gambar lama hanya diganti bila kamu unggah yang baru."
            : "Lengkapi detail menu, lalu unggah foto supaya tamu mudah memilih."}
        </p>
      </div>

      <form
        action={formAction}
        className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs"
      >
        {product ? <input type="hidden" name="id" value={product.id} /> : null}
        <input type="hidden" name="imageUrl" value={imageUrl ?? ""} />
        <input type="hidden" name="categoryId" value={categoryId} />

        {state.error ? (
          <Alert variant="destructive" className="px-3 py-2.5 text-xs">
            <CircleAlert />
            <AlertDescription className="text-xs font-medium">
              {state.error}
            </AlertDescription>
          </Alert>
        ) : null}

        {!hasCategories ? (
          <Alert className="px-3 py-2.5 text-xs">
            <Info />
            <AlertDescription className="text-xs font-medium">
              Belum ada kategori.{" "}
              <Link
                href="/admin/categories/create"
                className="font-bold underline underline-offset-2"
              >
                Buat kategori dulu
              </Link>{" "}
              sebelum menambah produk.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Dua kolom: informasi produk (kiri) — gambar (kanan) */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-4">
            {/* Nama */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-bold">
                Nama Produk
              </label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Nasi Goreng Sambal Matah"
                maxLength={80}
                className="h-10 rounded-lg"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label htmlFor="slug" className="block text-xs font-bold">
                Slug
              </label>
              <Input
                id="slug"
                value={previewSlug}
                disabled
                placeholder="nasi-goreng-sambal-matah"
                className="h-10 rounded-lg font-mono"
              />
              <p className="text-xs text-muted-foreground">
                {previewSlug
                  ? `Tersimpan sebagai: ${previewSlug} — otomatis dari nama.`
                  : "Otomatis dibuat dari nama produk."}
              </p>
            </div>

            {/* Kategori */}
            <div className="space-y-1.5">
              <label htmlFor="category-select" className="block text-xs font-bold">
                Kategori
              </label>
              <Select
                value={categoryId}
                onValueChange={(value) => setCategoryId(value ?? "")}
                items={categories.map((c) => ({value: c.id, label: c.name}))}
                disabled={!hasCategories}
              >
                <SelectTrigger
                  id="category-select"
                  className="h-10 w-full rounded-lg"
                >
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Harga */}
            <div className="space-y-1.5">
              <label htmlFor="price" className="block text-xs font-bold">
                Harga
              </label>
              <div className="relative">
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-muted-foreground"
                >
                  Rp
                </span>
                <Input
                  id="price"
                  inputMode="numeric"
                  value={formatRupiah(priceDigits)}
                  onChange={(e) =>
                    setPriceDigits(e.target.value.replace(/\D/g, "").slice(0, 12))
                  }
                  placeholder="25.000"
                  className="h-10 rounded-lg pr-3 pl-9 tnum"
                  required
                />
                <input type="hidden" name="price" value={priceDigits} />
              </div>
              <p className="text-xs text-muted-foreground">
                Rupiah, tanpa desimal.
              </p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-xs font-bold">
                Deskripsi
              </label>
              <Textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
                rows={4}
                maxLength={DESCRIPTION_MAX}
                placeholder="Bahan utama, porsi, atau catatan rasa…"
                className="rounded-lg text-sm"
                required
              />
              <p className="tnum text-xs text-muted-foreground">
                {description.length}/{DESCRIPTION_MAX} karakter
              </p>
            </div>
          </div>

          {/* Kolom kanan — hanya inputan gambar; sticky agar pratinjau tetap terlihat */}
          <div className="space-y-1.5 sm:sticky sm:top-20 sm:self-start lg:top-6">
            <span className="block text-xs font-bold">Gambar Produk</span>

            {!previewUrl ? (
              <label
                htmlFor="product-image"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  void handleFile(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "flex aspect-16/10 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-input bg-secondary/50 px-4 text-center transition-colors",
                  "hover:border-ring/60 hover:bg-accent/40",
                  "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50",
                  dragging && "border-ring bg-accent/60"
                )}
              >
                <input
                  ref={inputRef}
                  id="product-image"
                  type="file"
                  accept={PRODUCT_IMAGE_ACCEPT}
                  className="sr-only"
                  onChange={(e) => void handleFile(e.target.files?.[0])}
                />
                <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
                <span className="text-sm font-bold">
                  Pilih atau jatuhkan gambar di sini
                </span>
                <span className="tnum text-xs text-muted-foreground">
                  PNG, JPG, atau WEBP — maks {PRODUCT_IMAGE_MAX_LABEL}
                </span>
              </label>
            ) : (
              <div className="space-y-2">
                <div className="relative aspect-16/10 w-full overflow-hidden rounded-lg border border-border bg-secondary/40">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={
                        fileName ? `Pratinjau ${fileName}` : "Pratinjau gambar produk"
                      }
                      fill
                      sizes="(max-width: 640px) 100vw, 380px"
                      className="object-cover"
                    />
                  ) : (
                    // blob: URL untuk pratinjau seketika tidak didukung next/image
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt={
                        fileName ? `Pratinjau ${fileName}` : "Pratinjau gambar produk"
                      }
                      className="absolute inset-0 size-full object-cover"
                    />
                  )}

                  {uploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/60 text-background">
                      <Loader2 className="size-5 animate-spin" aria-hidden />
                      <span className="text-xs font-bold">Mengunggah…</span>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={clearImage}
                    disabled={uploading}
                    aria-label="Hapus gambar"
                    className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>

                {/* Status upload: ikon + label + warna (bukan warna saja) */}
                {uploadError ? (
                  <p className="flex items-start gap-1.5 text-xs font-bold text-destructive">
                    <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    {uploadError}
                  </p>
                ) : uploading ? (
                  <p className="flex items-start gap-1.5 text-xs font-bold text-status-waiting-fg">
                    <Loader2 className="mt-0.5 size-3.5 shrink-0 animate-spin" aria-hidden />
                    Mengunggah ke Supabase Storage…
                  </p>
                ) : imageUrl ? (
                  <p className="flex items-start gap-1.5 text-xs font-bold text-status-ready-fg">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    Gambar tersimpan — hanya tautan yang dikirim ke database.
                  </p>
                ) : null}

                {fileName && !uploadError ? (
                  <p className="truncate text-xs text-muted-foreground">{fileName}</p>
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Aksi — di bawah kedua kolom, rata kiri */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-11 cursor-pointer rounded-full text-sm font-bold"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan…
              </>
            ) : product ? (
              "Simpan Perubahan"
            ) : (
              "Simpan Produk"
            )}
          </Button>
          <Link
            href="/admin/menu"
            onClick={discardUpload}
            className={buttonVariants({
              variant: "outline",
              className: "h-11 rounded-full text-sm font-bold",
            })}
          >
            Batal
          </Link>
          {uploading ? (
            <p className="text-xs text-muted-foreground">
              Tunggu gambar selesai diunggah.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
