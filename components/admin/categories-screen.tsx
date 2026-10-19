"use client";

import Link from "next/link";
import { Pencil, Plus, Tags } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface CategoryListItem {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export function CategoriesScreen({
  categories,
}: {
  categories: CategoryListItem[];
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Kategori</h1>
          <p className="text-sm text-muted-foreground">
            Kelompokkan menu agar mudah dijelajahi tamu.
          </p>
        </div>
        <Link
          href="/admin/categories/create"
          className={buttonVariants({
            className: "h-9 rounded-full px-4 text-sm font-bold",
          })}
        >
          <Plus className="size-4" aria-hidden />
          Tambah Kategori
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Tags className="size-6 text-muted-foreground" aria-hidden />
          </span>
          <p className="font-heading font-bold">Belum ada kategori</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Buat kategori pertama untuk mulai mengelompokkan menu.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Tags className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading font-bold">{c.name}</p>
                <p className="tnum truncate text-xs text-muted-foreground">
                  {c.productCount} produk · {c.slug}
                </p>
              </div>
              <Link
                href={`/admin/categories/${c.id}/edit`}
                aria-label={`Edit ${c.name}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "icon-sm",
                  className: "shrink-0 rounded-full",
                })}
              >
                <Pencil className="size-4" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
