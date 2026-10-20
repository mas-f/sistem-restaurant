"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ImageOff, Plus, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProductDeleteButton } from "@/components/admin/product-delete-button";
import { cn, rupiah } from "@/lib/utils";

export interface MenuProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryName: string;
}

export interface MenuListScreenProps {
  products: MenuProductRow[];
  categories: { id: string; name: string }[];
  q: string;
  cat: string;
  page: number;
  totalPages: number;
  total: number;
  showingFrom: number;
  showingTo: number;
}

const DEBOUNCE_MS = 350;

const pillClasses = (active: boolean) =>
  cn(
    "h-8 cursor-pointer rounded-full border px-3 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card hover:bg-accent/50"
  );

const ProductThumbnail = ({ src, name }: { src: string; name: string }) => {
  const [failed, setFailed] = useState(false);
  const usable = Boolean(src) && !failed;

  return (
    <span className="relative block size-11 overflow-hidden rounded-lg border border-border bg-secondary/60">
      {usable ? (
        <Image
          src={src}
          alt={`Foto ${name}`}
          fill
          sizes="44px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center text-muted-foreground"
          title="Gambar tidak tersedia"
        >
          <ImageOff className="size-5" aria-hidden />
        </span>
      )}
    </span>
  );
};

export function MenuListScreen({
  products,
  categories,
  q,
  cat,
  page,
  totalPages,
  total,
  showingFrom,
  showingTo,
}: MenuListScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(q);
  const [lastQ, setLastQ] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sinkronkan input bila parameter berubah dari luar (back/forward browser).
  // Disesuaikan saat render, bukan di effect, agar tidak memicu cascading render.
  if (q !== lastQ) {
    setLastQ(q);
    setQuery(q);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /** Tulis parameter ke URL — halaman server yang membaca ulang datanya. */
  const navigate = (next: { q?: string; cat?: string; page?: number }) => {
    const nextQ = (next.q ?? query).trim();
    const nextCat = next.cat ?? cat;
    const nextPage = next.page ?? 1;

    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextCat) params.set("cat", nextCat);
    if (nextPage > 1) params.set("page", String(nextPage));

    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    });
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate({ q: value, page: 1 });
    }, DEBOUNCE_MS);
  };

  const resetFilters = () => {
    setQuery("");
    navigate({ q: "", cat: "", page: 1 });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Menu</h1>
          <p className="tnum text-sm text-muted-foreground">
            {total} produk terdaftar.
          </p>
        </div>
        <Link
          href="/admin/menu/create"
          className="flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus className="size-4" aria-hidden /> Tambah Produk
        </Link>
      </div>

      {/* Filter: cari nama + pill kategori dari database */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Cari produk…"
            aria-label="Cari produk"
            className="h-9 w-full rounded-full border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => navigate({ cat: "", page: 1 })}
            aria-pressed={cat === ""}
            className={pillClasses(cat === "")}
          >
            Semua
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => navigate({ cat: category.id, page: 1 })}
              aria-pressed={cat === category.id}
              className={pillClasses(cat === category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {products.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-2.5 w-11">Gambar</th>
                <th className="px-4 py-2.5">Nama</th>
                <th className="px-4 py-2.5">Kategori</th>
                <th className="px-4 py-2.5 text-right">Harga</th>
                {/* Status — dikomentari: field availability/popular belum ada di schema Product.
                <th className="px-4 py-2.5">Status</th> */}
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="align-top hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <ProductThumbnail
                      src={product.imageUrl}
                      name={product.name}
                    />
                  </td>
                  <td className="max-w-40 px-4 py-3 font-bold">
                    {/* {product.name} */}
                    <span>
                      <span className="block font-semibold">{product.name}</span>
                      <span className="block max-w-md truncate text-xs text-muted-foreground">
                        {product.description}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs font-bold">
                      {product.categoryName}
                    </span>
                  </td>
                  <td className="tnum px-4 py-3 text-right font-bold">
                    {rupiah(product.price)}
                  </td>
                  {/* Status — dikomentari: menunggu field availability di schema Product.
                  <td className="px-4 py-3">…</td> */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <ProductDeleteButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          {total === 0 ? (
            <>
              <span className="mb-1 flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Plus className="size-5" aria-hidden />
              </span>
              <p className="font-heading font-bold">Belum ada produk</p>
              <p className="text-sm text-muted-foreground">
                Tambahkan menu pertama agar tampil di halaman ini.
              </p>
              <Link
                href="/admin/menu/create"
                className={buttonVariants({
                  className: "mt-2 h-9 rounded-full text-sm font-bold",
                })}
              >
                Tambah Produk
              </Link>
            </>
          ) : (
            <>
              <span className="mb-1 flex size-11 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Search className="size-5" aria-hidden />
              </span>
              <p className="font-heading font-bold">Tidak ada produk yang cocok</p>
              <p className="text-sm text-muted-foreground">
                {q ? (
                  <>
                    Untuk pencarian{" "}
                    <span className="font-bold text-foreground">“{q}”</span>{" "}
                    tidak ditemukan.
                  </>
                ) : (
                  "Di kategori ini belum ada produk."
                )}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className={buttonVariants({
                  variant: "outline",
                  className: "mt-2 h-9 cursor-pointer rounded-full text-sm font-bold",
                })}
              >
                Reset filter
              </button>
            </>
          )}
        </div>
      )}

      {total > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="tnum text-xs text-muted-foreground">
            Menampilkan {showingFrom}–{showingTo} dari {total} produk
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate({ page: page - 1 })}
              disabled={page <= 1 || isPending}
              className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-bold transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="size-3.5" aria-hidden /> Sebelumnya
            </button>
            <span className="tnum text-xs font-bold text-muted-foreground">
              Halaman {page} dari {totalPages}
            </span>
            <button
              type="button"
              onClick={() => navigate({ page: page + 1 })}
              disabled={page >= totalPages || isPending}
              className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border border-border bg-card px-3 text-xs font-bold transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              Berikutnya <ChevronRight className="size-3.5" aria-hidden />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
