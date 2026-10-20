"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CircleAlert, Loader2, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/lib/action";

export interface CategoryFormData {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const CategoryFormScreen = ({ category }: { category?: CategoryFormData }) => {
  const isEdit = Boolean(category);
  const [state, formAction, pending] = useActionState(isEdit ? updateCategoryAction : createCategoryAction, {});
  const [name, setName] = useState(category?.name ?? "");
  const [sortOrder, setSortOrder] = useState(category?.sortOrder ?? 0);

  const previewSlug = slugify(name) || category?.slug || "";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">
          {isEdit ? "Edit Kategori" : "Tambah Kategori"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Perbarui nama atau urutan kategori ini."
            : "Kelompokkan menu agar mudah dijelajahi tamu."}
        </p>
      </div>

      <form
        action={formAction}
        className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs"
      >
        {isEdit ? <input type="hidden" name="id" value={category!.id} /> : null}

        {state.error ? (
          <Alert variant="destructive" className="px-3 py-2.5 text-xs">
            <CircleAlert />
            <AlertDescription className="text-xs font-medium">
              {state.error}
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-bold">
            Nama Kategori
          </label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Minuman"
            className="h-10 rounded-lg"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="slug" className="block text-xs font-bold">
            Slug
          </label>
          <Input
            id="slug"
            value={previewSlug}
            disabled
            placeholder="minuman"
            className="h-10 rounded-lg font-mono"
          />
          <p className="text-xs text-muted-foreground">
            {previewSlug
              ? `Tersimpan sebagai: ${previewSlug} — otomatis dari nama.`
              : "Kosongkan untuk otomatis dari nama."}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sortOrder" className="block text-xs font-bold">
            Urutan
          </label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Math.max(0, Number.parseInt(e.target.value, 10) || 0))}
            className="h-10 w-28 rounded-lg tnum"
          />
          <p className="text-xs text-muted-foreground">
            Makin kecil, makin awal tampil.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button
            type="submit"
            disabled={pending}
            className="h-11 rounded-lg text-sm font-bold cursor-pointer"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan...
              </>
            ) : isEdit ? (
              "Simpan Perubahan"
            ) : (
              "Simpan Kategori"
            )}
          </Button>
          <Link
            href="/admin/categories"
            className={buttonVariants({
              variant: "outline",
              className: "h-11 rounded-full text-sm font-bold",
            })}
          >
            Batal
          </Link>
        </div>
      </form>

      {category ? (
        <CategoryDeleteSection
          categoryId={category.id}
          categoryName={category.name}
        />
      ) : null}
    </div>
  );
}

const CategoryDeleteSection = ({ categoryId, categoryName, }: { categoryId: string; categoryName: string; }) => {
  const [state, formAction, pending] = useActionState(deleteCategoryAction, {});

  return (
    <section className="max-w-lg space-y-3 rounded-xl border border-destructive/30 bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <TriangleAlert className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-heading font-bold">Hapus Kategori</h2>
          <p className="text-sm text-muted-foreground">
            Kategori “{categoryName}” akan dihapus permanen. Tindakan ini tidak
            bisa dibatalkan.
          </p>
        </div>
      </div>

      <Dialog>
        <DialogTrigger
          className={buttonVariants({
            variant: "destructive",
            className: "h-10 rounded-full px-4 text-sm font-bold cursor-pointer",
          })}
        >
          Hapus Kategori
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading font-bold">
              Hapus “{categoryName}”?
            </DialogTitle>
            <DialogDescription>
              Kategori akan dihapus dari daftar. Kategori yang masih berisi
              produk tidak bisa dihapus.
            </DialogDescription>
          </DialogHeader>

          {state.error ? (
            <Alert variant="destructive" className="px-3 py-2.5 text-xs">
              <CircleAlert />
              <AlertDescription className="text-xs font-medium">
                {state.error}
              </AlertDescription>
            </Alert>
          ) : null}

          <form action={formAction} className="space-y-3">
            <input type="hidden" name="id" value={categoryId} />
            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    className="h-10 rounded-full px-4 text-sm font-bold cursor-pointer"
                  />
                }
              >
                Batal
              </DialogClose>
              <Button
                type="submit"
                variant="destructive"
                disabled={pending}
                className="h-10 rounded-full px-4 text-sm font-bold cursor-pointer"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
