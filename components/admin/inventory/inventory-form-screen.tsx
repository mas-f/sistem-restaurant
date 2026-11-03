"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CircleAlert, Loader2, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createIngredientAction, updateIngredientAction } from "@/lib/action";
import { INVENTORY_UNITS } from "@/lib/inventory";
import type { IngredientUnit } from "@/lib/generated/prisma/enums";

export interface SupplierOption {
  id: string;
  name: string;
}

export interface IngredientFormData {
  id: string;
  name: string;
  unit: IngredientUnit;
  minStock: number;
  costPerUnit: number;
  supplierId: string | null;
  isActive: boolean;
  movementCount: number;
}

const formatRupiah = (digits: string) =>
  digits ? Number(digits).toLocaleString("id-ID") : "";

export function InventoryFormScreen({
  suppliers,
  ingredient,
}: {
  suppliers: SupplierOption[];
  ingredient?: IngredientFormData;
}) {
  const isEdit = Boolean(ingredient);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateIngredientAction : createIngredientAction,
    {}
  );

  const [name, setName] = useState(ingredient?.name ?? "");
  const [unit, setUnit] = useState<IngredientUnit>(ingredient?.unit ?? "kg");
  const [stock, setStock] = useState("");
  const [minStock, setMinStock] = useState(
    ingredient ? String(ingredient.minStock) : ""
  );
  const [costDigits, setCostDigits] = useState(
    ingredient ? String(ingredient.costPerUnit) : ""
  );
  const [supplierId, setSupplierId] = useState(ingredient?.supplierId ?? "");
  const [isActive, setIsActive] = useState(ingredient?.isActive ?? true);

  const unitLocked = Boolean(ingredient && ingredient.movementCount > 0);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={ingredient ? `/admin/inventory/${ingredient.id}` : "/admin/inventory"}
          className="text-xs font-bold text-muted-foreground hover:text-primary hover:underline"
        >
          ← Kembali ke inventaris
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-extrabold">
          {isEdit ? "Edit Bahan" : "Tambah Bahan"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Perbarui data bahan. Stok tidak diedit di sini — gunakan mutasi stok agar riwayatnya tercatat."
            : "Daftarkan bahan baku beserta stok awal, ambang minimum, dan supplier."}
        </p>
      </div>

      <form
        action={formAction}
        className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs"
      >
        {isEdit ? <input type="hidden" name="id" value={ingredient!.id} /> : null}

        {state.error ? (
          <Alert variant="destructive" className="px-3 py-2.5 text-xs">
            <CircleAlert />
            <AlertDescription className="text-xs font-medium">
              {state.error}
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Nama */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-bold">
            Nama Bahan
          </label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Contoh: Daging Ayam Fillet"
            maxLength={80}
            className="h-10 rounded-lg"
            required
          />
          <p className="text-xs text-muted-foreground">
            Nama bahan harus unik agar stok tidak tercatat ganda.
          </p>
        </div>

        {/* Satuan */}
        <div className="space-y-1.5">
          <label
            htmlFor={unitLocked ? undefined : "unit"}
            className="block text-xs font-bold"
          >
            Satuan
          </label>
          {unitLocked ? (
            <>
              {/* Kontrol disabled tidak ikut terkirim saat submit — nilai
                  satuan dibawa lewat hidden input, tampilannya read-only. */}
              <input type="hidden" name="unit" value={unit} />
              <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-input bg-secondary/50 px-3 text-sm">
                <span className="font-semibold">
                  {INVENTORY_UNITS.find((option) => option.value === unit)?.label ??
                    unit}
                </span>
                <Lock
                  className="size-3.5 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3" aria-hidden />
                Satuan terkunci karena bahan ini sudah punya riwayat stok.
              </p>
            </>
          ) : (
            <select
              id="unit"
              name="unit"
              value={unit}
              onChange={(event) =>
                setUnit(event.target.value as IngredientUnit)
              }
              className="h-10 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              required
            >
              {INVENTORY_UNITS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Stok awal (create) */}
          {!isEdit ? (
            <div className="space-y-1.5">
              <label htmlFor="stock" className="block text-xs font-bold">
                Stok Awal
              </label>
              <Input
                id="stock"
                name="stock"
                inputMode="decimal"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                placeholder="0"
                className="h-10 rounded-lg tnum"
                autoComplete="off"
                required
              />
              <p className="text-xs text-muted-foreground">
                Boleh 0 jika belum ada stok.
              </p>
            </div>
          ) : null}

          {/* Stok minimum */}
          <div className="space-y-1.5">
            <label htmlFor="minStock" className="block text-xs font-bold">
              Stok Minimum
            </label>
            <Input
              id="minStock"
              name="minStock"
              inputMode="decimal"
              value={minStock}
              onChange={(event) => setMinStock(event.target.value)}
              placeholder="Contoh: 5"
              className="h-10 rounded-lg tnum"
              autoComplete="off"
              required
            />
            <p className="text-xs text-muted-foreground">
              Batas peringatan restock.
            </p>
          </div>
        </div>

        {/* Harga satuan */}
        <div className="space-y-1.5">
          <label htmlFor="costPerUnit" className="block text-xs font-bold">
            Harga Satuan
          </label>
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-bold text-muted-foreground"
            >
              Rp
            </span>
            <Input
              id="costPerUnit"
              inputMode="numeric"
              value={formatRupiah(costDigits)}
              onChange={(event) =>
                setCostDigits(
                  event.target.value.replace(/\D/g, "").slice(0, 9)
                )
              }
              placeholder="25.000"
              className="h-10 rounded-lg pr-3 pl-9 tnum"
              autoComplete="off"
              required
            />
            <input type="hidden" name="costPerUnit" value={costDigits} />
          </div>
          <p className="text-xs text-muted-foreground">
            Rupiah per satuan, tanpa desimal. Dipakai menghitung nilai inventaris.
          </p>
        </div>

        {/* Supplier */}
        <div className="space-y-1.5">
          <label htmlFor="supplierId" className="block text-xs font-bold">
            Supplier
          </label>
          <select
            id="supplierId"
            name="supplierId"
            value={supplierId}
            onChange={(event) => setSupplierId(event.target.value)}
            className="h-10 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="">Tanpa supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Supplier aktif yang terdaftar di menu Supplier.
          </p>
        </div>

        {/* Status aktif */}
        {isEdit ? (
          <div className="space-y-1.5">
            <input
              type="hidden"
              name="isActive"
              value={isActive ? "true" : "false"}
            />
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border px-3 py-2.5">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                className="size-4 cursor-pointer accent-primary"
              />
              <span className="text-sm font-semibold">
                Bahan aktif
              </span>
              <span className="text-xs text-muted-foreground">
                Nonaktifkan bila bahan tidak dipakai lagi.
              </span>
            </label>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            type="submit"
            disabled={pending}
            className="h-10 cursor-pointer rounded-full px-5 text-sm font-bold"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Menyimpan...
              </>
            ) : isEdit ? (
              "Simpan Perubahan"
            ) : (
              "Tambah Bahan"
            )}
          </Button>
          <Link
            href={
              ingredient
                ? `/admin/inventory/${ingredient.id}`
                : "/admin/inventory"
            }
            className={buttonVariants({
              variant: "outline",
              className: "h-10 rounded-full px-5 text-sm font-bold",
            })}
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
