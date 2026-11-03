"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  Loader2,
  PackagePlus,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { adjustStockAction } from "@/lib/action";
import { formatQuantity } from "@/lib/inventory";
import type { IngredientUnit } from "@/lib/generated/prisma/enums";
import { cn } from "@/lib/utils";

type Mode = "in" | "out" | "adjustment";

const MODES: { value: Mode; label: string; icon: typeof ArrowDownToLine }[] = [
  { value: "in", label: "Masuk", icon: ArrowDownToLine },
  { value: "out", label: "Keluar", icon: ArrowUpFromLine },
  { value: "adjustment", label: "Penyesuaian", icon: ClipboardCheck },
];

export function StockAdjustDialog({
  ingredientId,
  name,
  unit,
  stock,
  trigger = "icon",
}: {
  ingredientId: string;
  name: string;
  unit: IngredientUnit | string;
  stock: number;
  /** "icon" untuk baris tabel, "button" untuk halaman detail. */
  trigger?: "icon" | "button";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("in");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const numeric = Number(value.replace(",", "."));
  const hasValue = value.trim() !== "" && Number.isFinite(numeric);
  const nextStock =
    mode === "adjustment"
      ? numeric
      : mode === "in"
        ? stock + numeric
        : stock - numeric;
  const valid =
    hasValue &&
    nextStock >= 0 &&
    (mode === "adjustment" ? nextStock !== stock : numeric > 0);

  const reset = () => {
    setMode("in");
    setValue("");
    setNote("");
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  const submit = () => {
    if (!valid || pending) return;
    setError(null);

    startTransition(async () => {
      const result =
        mode === "adjustment"
          ? await adjustStockAction({
              ingredientId,
              type: "adjustment",
              targetStock: numeric,
              note,
            })
          : await adjustStockAction({
              ingredientId,
              type: mode,
              quantity: numeric,
              note,
            });

      if (result.error) {
        setError(result.error);
        return;
      }

      setOpen(false);
      reset();
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger === "button" ? (
        <DialogTrigger
          render={
            <Button className="h-9 cursor-pointer rounded-full px-4 text-sm font-bold" />
          }
        >
          <PackagePlus className="size-4" aria-hidden /> Sesuaikan Stok
        </DialogTrigger>
      ) : (
        <DialogTrigger
          aria-label={`Sesuaikan stok ${name}`}
          title={`Sesuaikan stok ${name}`}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <PackagePlus className="size-4" aria-hidden />
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading font-bold">
            Sesuaikan Stok {name}
          </DialogTitle>
          <DialogDescription>
            Stok saat ini {formatQuantity(stock, unit)}. Setiap perubahan dicatat
            di riwayat bahan.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <Alert variant="destructive" className="px-3 py-2.5 text-xs">
            <AlertDescription className="text-xs font-medium">
              {error}
            </AlertDescription>
          </Alert>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <div
            role="group"
            aria-label="Jenis mutasi stok"
            className="grid grid-cols-3 gap-1.5"
          >
            {MODES.map((option) => {
              const Icon = option.icon;
              const active = mode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setMode(option.value);
                    setValue("");
                    setError(null);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-accent/50"
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="stock-amount" className="block text-xs font-bold">
              {mode === "adjustment" ? "Stok hasil hitung fisik" : "Jumlah"}
            </label>
            <Input
              id="stock-amount"
              inputMode="decimal"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={mode === "adjustment" ? "Contoh: 12.5" : "Contoh: 2.5"}
              className="h-10 rounded-lg tnum"
              autoComplete="off"
              required
            />
            <p className="tnum text-xs text-muted-foreground">
              {hasValue && Number.isFinite(nextStock) ? (
                nextStock >= 0 ? (
                  <>
                    Stok menjadi{" "}
                    <strong className="text-foreground">
                      {formatQuantity(nextStock, unit)}
                    </strong>{" "}
                    ({nextStock >= stock ? "+" : ""}
                    {formatQuantity(Math.abs(nextStock - stock), unit)}).
                  </>
                ) : (
                  <span className="text-status-error-fg">
                    Stok tidak boleh minus.
                  </span>
                )
              ) : (
                "Gunakan titik atau koma untuk desimal, maksimal 2 angka."
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="stock-note" className="block text-xs font-bold">
              Catatan <span className="font-normal text-muted-foreground">(opsional)</span>
            </label>
            <Textarea
              id="stock-note"
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 200))}
              rows={2}
              maxLength={200}
              placeholder="Contoh: Beli dari supplier / pemakaian dapur shift siang"
              className="rounded-lg text-sm"
            />
          </div>

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 cursor-pointer rounded-full px-4 text-sm font-bold"
                />
              }
            >
              Batal
            </DialogClose>
            <Button
              type="submit"
              disabled={!valid || pending}
              className="h-10 cursor-pointer rounded-full px-4 text-sm font-bold"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Menyimpan...
                </>
              ) : mode === "adjustment" ? (
                "Simpan Penyesuaian"
              ) : mode === "in" ? (
                "Tambah Stok"
              ) : (
                "Kurangi Stok"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
