"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CircleAlert,
  CircleCheck,
  Loader2,
  PackagePlus,
  Plus,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProductRecipeAction } from "@/lib/action";
import { formatQuantity, UNIT_ABBREVIATION } from "@/lib/inventory";
import {
  availabilityFromLines,
  availabilityReason,
  recipeCost,
  type RecipeLine,
} from "@/lib/recipe";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { IngredientUnit } from "@/lib/generated/prisma/enums";

export interface RecipeIngredientOption {
  id: string;
  name: string;
  unit: IngredientUnit;
  stock: number;
  costPerUnit: number;
  isActive: boolean;
}

export interface RecipeInitialLine {
  ingredientId: string;
  quantity: string;
}

export interface RecipeProductInfo {
  id: string;
  name: string;
  price: number;
  categoryName: string;
}

type Row = {
  key: number;
  ingredientId: string;
  quantity: string;
};

export function RecipeScreen({
  product,
  ingredients,
  initialLines,
}: {
  product: RecipeProductInfo;
  ingredients: RecipeIngredientOption[];
  initialLines: RecipeInitialLine[];
}) {
  const router = useRouter();
  const keyRef = useRef(initialLines.length);
  const [rows, setRows] = useState<Row[]>(
    initialLines.map((line, index) => ({
      key: index,
      ingredientId: line.ingredientId,
      quantity: line.quantity,
    }))
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const ingredientById = new Map(
    ingredients.map((ingredient) => [ingredient.id, ingredient])
  );

  const usedIds = new Set(
    rows.map((row) => row.ingredientId).filter(Boolean)
  );

  const previewLines: RecipeLine[] = rows
    .map((row): RecipeLine | null => {
      const ingredient = ingredientById.get(row.ingredientId);
      const quantity = Number(row.quantity.replace(",", "."));
      if (!ingredient || !Number.isFinite(quantity) || quantity <= 0) {
        return null;
      }
      return {
        ingredientId: ingredient.id,
        ingredientName: ingredient.name,
        unit: ingredient.unit,
        quantity,
        costPerUnit: ingredient.costPerUnit,
        stock: ingredient.stock,
        isActive: ingredient.isActive,
      };
    })
    .filter((line): line is RecipeLine => line !== null);

  const incomplete = previewLines.length !== rows.length;
  const cost = recipeCost(previewLines);
  const margin = product.price - cost;
  const marginPercent =
    product.price > 0 ? Math.round((margin / product.price) * 100) : 0;
  const availability = availabilityFromLines(previewLines);
  const canSave =
    rows.length > 0 && !incomplete && availability.state !== "NO_RECIPE" && !pending;

  const addRow = () => {
    const next = ingredients.find(
      (ingredient) => !usedIds.has(ingredient.id) && ingredient.isActive
    );
    setSaved(false);
    setRows((current) => [
      ...current,
      { key: ++keyRef.current, ingredientId: next?.id ?? "", quantity: "" },
    ]);
  };

  const removeRow = (key: number) => {
    setSaved(false);
    setRows((current) => current.filter((row) => row.key !== key));
  };

  const updateRow = (key: number, patch: Partial<Row>) => {
    setSaved(false);
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row))
    );
  };

  const submit = () => {
    if (!canSave || pending) return;
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await saveProductRecipeAction(
        product.id,
        rows.map((row) => ({
          ingredientId: row.ingredientId,
          quantity: Number(row.quantity.replace(",", ".")),
        }))
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      setSaved(true);
      router.refresh();
    });
  };

  const summary = [
    {
      label: "HPP / Porsi",
      value: rupiah(cost),
      hint: "total harga bahan",
    },
    {
      label: "Harga Jual",
      value: rupiah(product.price),
      hint: "harga di menu tamu",
    },
    {
      label: "Margin",
      value: `${rupiah(margin)} (${marginPercent}%)`,
      hint: margin >= 0 ? "di atas HPP" : "di bawah HPP",
      tone: margin >= 0 ? "text-status-available-fg" : "text-status-error-fg",
    },
    {
      label: "Estimasi Porsi",
      value:
        availability.state === "AVAILABLE"
          ? `${availability.portions} porsi`
          : "0 porsi",
      hint: availabilityReason(availability).toLowerCase(),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/menu"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary hover:underline"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> Kembali ke menu
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-extrabold">
              Resep {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Bahan baku yang dipakai untuk satu porsi. Stok dipotong otomatis
              setiap pesanan dibuat.
            </p>
          </div>
          <Link
            href={`/admin/menu/${product.id}/edit`}
            className={buttonVariants({
              variant: "outline",
              className: "h-9 rounded-full px-4 text-sm font-bold",
            })}
          >
            Edit detail menu
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <p className="text-xs font-semibold text-muted-foreground">
              {item.label}
            </p>
            <p
              className={cn(
                "tnum mt-1.5 font-heading text-lg font-extrabold",
                item.tone
              )}
            >
              {item.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
          </div>
        ))}
      </div>

      {error ? (
        <Alert variant="destructive" className="px-3 py-2.5 text-xs">
          <CircleAlert />
          <AlertDescription className="text-xs font-medium">
            {error}
          </AlertDescription>
        </Alert>
      ) : null}

      {saved ? (
        <Alert className="border-status-available-fg/30 bg-status-available-bg px-3 py-2.5 text-xs text-status-available-fg">
          <CircleCheck />
          <AlertDescription className="text-xs font-medium text-status-available-fg">
            Resep tersimpan. Stok dan ketersediaan menu sudah diperbarui.
          </AlertDescription>
        </Alert>
      ) : null}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-sm font-extrabold">
              Komposisi Bahan
            </h2>
            <p className="text-xs text-muted-foreground">
              Jumlah dihitung per 1 porsi terjual.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addRow}
            className="h-9 cursor-pointer rounded-full px-4 text-sm font-bold"
          >
            <Plus className="size-4" aria-hidden /> Tambah Bahan
          </Button>
        </div>

        {rows.length > 0 ? (
          <div className="space-y-2.5">
            {rows.map((row) => {
              const ingredient = ingredientById.get(row.ingredientId);
              const quantity = Number(row.quantity.replace(",", "."));
              const safeQuantity =
                Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
              const lineCost = ingredient
                ? Math.round(safeQuantity * ingredient.costPerUnit)
                : 0;
              const overStock =
                Boolean(ingredient) &&
                safeQuantity > 0 &&
                safeQuantity > (ingredient?.stock ?? 0);
              const options = ingredients.filter(
                (option) =>
                  option.id === row.ingredientId || !usedIds.has(option.id)
              );

              return (
                <div
                  key={row.key}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-48 flex-1 space-y-1">
                      <label
                        htmlFor={`ingredient-${row.key}`}
                        className="block text-xs font-bold"
                      >
                        Bahan
                      </label>
                      <select
                        id={`ingredient-${row.key}`}
                        value={row.ingredientId}
                        onChange={(event) =>
                          updateRow(row.key, {
                            ingredientId: event.target.value,
                          })
                        }
                        className="h-10 w-full cursor-pointer rounded-lg border border-input bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        required
                      >
                        <option value="">Pilih bahan…</option>
                        {options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                            {option.isActive ? "" : " (nonaktif)"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-28 space-y-1">
                      <label
                        htmlFor={`quantity-${row.key}`}
                        className="block text-xs font-bold"
                      >
                        Jumlah
                      </label>
                      <Input
                        id={`quantity-${row.key}`}
                        inputMode="decimal"
                        value={row.quantity}
                        onChange={(event) =>
                          updateRow(row.key, { quantity: event.target.value })
                        }
                        placeholder="0,15"
                        className="h-10 rounded-lg tnum"
                        autoComplete="off"
                        required
                      />
                    </div>

                    <div className="w-16 space-y-1">
                      <span className="block text-xs font-bold">Satuan</span>
                      <div className="flex h-10 items-center justify-center rounded-lg border border-input bg-secondary/50 px-2 text-sm font-semibold">
                        {ingredient
                          ? UNIT_ABBREVIATION[ingredient.unit]
                          : "—"}
                      </div>
                    </div>

                    <div className="w-28 space-y-1 text-right">
                      <span className="block text-xs font-bold">Biaya</span>
                      <div className="tnum flex h-10 items-center justify-end text-sm font-bold">
                        {rupiah(lineCost)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      aria-label="Hapus bahan dari resep"
                      title="Hapus bahan dari resep"
                      className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>

                  <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {ingredient ? (
                      <span className="tnum">
                        Stok:{" "}
                        {formatQuantity(ingredient.stock, ingredient.unit)}
                      </span>
                    ) : (
                      <span>Pilih bahan terlebih dahulu.</span>
                    )}
                    {ingredient && overStock ? (
                      <span className="flex items-center gap-1 font-semibold text-status-error-fg">
                        <TriangleAlert className="size-3" aria-hidden />
                        Jumlah melebihi stok — menu tidak bisa dipesan.
                      </span>
                    ) : null}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <PackagePlus
              className="mx-auto size-6 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-2 font-heading text-sm font-bold">
              Belum ada bahan pada resep ini
            </p>
            <p className="text-xs text-muted-foreground">
              Menu tanpa resep tidak bisa dipesan tamu. Tambahkan minimal satu
              bahan.
            </p>
          </div>
        )}

        {incomplete && rows.length > 0 ? (
          <p className="flex items-center gap-1.5 text-xs font-medium text-status-preparing-fg">
            <CircleAlert className="size-3.5" aria-hidden />
            Lengkapi bahan dan jumlah pada semua baris sebelum menyimpan.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button
            type="submit"
            disabled={!canSave}
            className="h-10 cursor-pointer rounded-full px-5 text-sm font-bold"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden /> Simpan Resep
              </>
            )}
          </Button>
          <Link
            href="/admin/menu"
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
