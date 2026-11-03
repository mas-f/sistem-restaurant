"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Eye,
  Package,
  Pencil,
  Plus,
  Search,
  TriangleAlert,
  Wallet,
  XCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { InventoryStatusBadge } from "@/components/admin/inventory/inventory-status-badge";
import { InventoryDeleteButton } from "@/components/admin/inventory/inventory-delete-button";
import { StockAdjustDialog } from "@/components/admin/inventory/stock-adjust-dialog";
import {
  formatQuantity,
  type InventoryStatus,
} from "@/lib/inventory";
import type { IngredientUnit } from "@/lib/generated/prisma/enums";
import { rupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface InventoryRow {
  id: string;
  name: string;
  unit: IngredientUnit;
  stock: number;
  minStock: number;
  costPerUnit: number;
  value: number;
  supplierName: string | null;
  status: InventoryStatus;
  isActive: boolean;
  movementCount: number;
}

export interface InventoryKpis {
  total: number;
  low: number;
  out: number;
  value: number;
}

export type InventoryStatusFilter =
  | ""
  | InventoryStatus
  | "INACTIVE";

export interface InventoryScreenProps {
  rows: InventoryRow[];
  suppliers: { id: string; name: string }[];
  kpis: InventoryKpis;
  q: string;
  status: InventoryStatusFilter;
  supplier: string;
  page: number;
  totalPages: number;
  total: number;
  showingFrom: number;
  showingTo: number;
}

const DEBOUNCE_MS = 350;

const STATUS_FILTERS: { value: InventoryStatusFilter; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "IN_STOCK", label: "Aman" },
  { value: "LOW_STOCK", label: "Menipis" },
  { value: "OUT_OF_STOCK", label: "Habis" },
  { value: "INACTIVE", label: "Nonaktif" },
];

const pillClasses = (active: boolean) =>
  cn(
    "h-8 cursor-pointer rounded-full border px-3 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-card hover:bg-accent/50"
  );

export function InventoryScreen({
  rows,
  suppliers,
  kpis,
  q,
  status,
  supplier,
  page,
  totalPages,
  total,
  showingFrom,
  showingTo,
}: InventoryScreenProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(q);
  const [lastQ, setLastQ] = useState(q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (q !== lastQ) {
    setLastQ(q);
    setQuery(q);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const navigate = (next: {
    q?: string;
    status?: InventoryStatusFilter;
    supplier?: string;
    page?: number;
  }) => {
    const nextQ = (next.q ?? query).trim();
    const nextStatus = next.status ?? status;
    const nextSupplier = next.supplier ?? supplier;
    const nextPage = next.page ?? 1;

    const params = new URLSearchParams();
    if (nextQ) params.set("q", nextQ);
    if (nextStatus) params.set("status", nextStatus);
    if (nextSupplier) params.set("supplier", nextSupplier);
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
    navigate({ q: "", status: "", supplier: "", page: 1 });
  };

  const kpiCards = [
    {
      label: "Total Bahan",
      value: String(kpis.total),
      hint: "bahan aktif terdaftar",
      icon: Package,
      tone: "text-status-occupied-fg bg-status-occupied-bg",
    },
    {
      label: "Stok Menipis",
      value: String(kpis.low),
      hint: "di bawah ambang minimum",
      icon: TriangleAlert,
      tone: "text-status-preparing-fg bg-status-preparing-bg",
    },
    {
      label: "Stok Habis",
      value: String(kpis.out),
      hint: "perlu restock segera",
      icon: XCircle,
      tone: "text-status-error-fg bg-status-error-bg",
    },
    {
      label: "Nilai Inventaris",
      value: rupiah(kpis.value),
      hint: "stok × harga satuan",
      icon: Wallet,
      tone: "text-status-available-fg bg-status-available-bg",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Inventaris</h1>
          <p className="text-sm text-muted-foreground">
            Stok bahan baku, ambang pemesanan ulang, dan nilai persediaan.
          </p>
        </div>
        <Link
          href="/admin/inventory/create"
          className="flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus className="size-4" aria-hidden /> Tambah Bahan
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-xl border border-border bg-card p-4 shadow-[0_2px_4px_-1px_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {kpi.label}
                </p>
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    kpi.tone
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
              </div>
              <p className="tnum mt-2 font-heading text-xl font-extrabold">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Cari bahan…"
            aria-label="Cari bahan"
            className="h-9 w-full rounded-full border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => navigate({ status: filter.value, page: 1 })}
              aria-pressed={status === filter.value}
              className={pillClasses(status === filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <select
          value={supplier}
          onChange={(event) =>
            navigate({ supplier: event.target.value, page: 1 })
          }
          aria-label="Filter supplier"
          className="h-9 cursor-pointer rounded-full border border-border bg-card px-3 text-xs font-bold focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <option value="">Semua supplier</option>
          {suppliers.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        {isPending ? (
          <span className="text-xs font-semibold text-muted-foreground">
            Memuat…
          </span>
        ) : null}
      </div>

      {rows.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/60 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
                <th className="px-4 py-2.5">Bahan</th>
                <th className="px-4 py-2.5">Supplier</th>
                <th className="w-56 px-4 py-2.5">Stok</th>
                <th className="px-4 py-2.5 text-right">Minimum</th>
                <th className="px-4 py-2.5 text-right">Harga/Unit</th>
                <th className="px-4 py-2.5 text-right">Nilai</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const target = row.minStock * 1.5;
                const pct =
                  row.status === "OUT_OF_STOCK"
                    ? 0
                    : target > 0
                      ? Math.min(100, (row.stock / target) * 100)
                      : 100;

                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "hover:bg-secondary/40",
                      row.status === "OUT_OF_STOCK" && "bg-status-error-bg/30",
                      row.status === "LOW_STOCK" &&
                      "bg-status-preparing-bg/20"
                    )}
                  >
                    <td className="max-w-56 px-4 py-3">
                      <span className="flex flex-wrap items-center gap-2 font-semibold">
                        <Link
                          href={`/admin/inventory/${row.id}`}
                          className="truncate hover:text-primary hover:underline"
                        >
                          {row.name}
                        </Link>
                        {!row.isActive ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                            Nonaktif
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.supplierName ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          role="progressbar"
                          aria-valuenow={Math.round(pct)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Stok ${row.name}`}
                          className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                        >
                          <div
                            className={cn(
                              "h-full rounded-full",
                              row.status === "OUT_OF_STOCK"
                                ? "bg-status-error"
                                : row.status === "LOW_STOCK"
                                  ? "bg-status-preparing"
                                  : "bg-status-available"
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="tnum w-24 text-right text-xs font-bold">
                          {formatQuantity(row.stock, row.unit)}
                        </span>
                      </div>
                    </td>
                    <td className="tnum px-4 py-3 text-right text-muted-foreground">
                      {formatQuantity(row.minStock, row.unit)}
                    </td>
                    <td className="tnum px-4 py-3 text-right">
                      {rupiah(row.costPerUnit)}
                    </td>
                    <td className="tnum px-4 py-3 text-right font-bold">
                      {rupiah(row.value)}
                    </td>
                    <td className="px-4 py-3">
                      {row.isActive ? (
                        <InventoryStatusBadge status={row.status} />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                          <CircleAlert className="size-3" aria-hidden />
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {row.isActive ? (
                          <StockAdjustDialog
                            ingredientId={row.id}
                            name={row.name}
                            unit={row.unit}
                            stock={row.stock}
                          />
                        ) : null}
                        <Link
                          href={`/admin/inventory/${row.id}`}
                          aria-label={`Edit ${row.name}`}
                          title={`Edit ${row.name}`}
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          <Eye className="size-4" aria-hidden />
                        </Link>
                        <Link
                          href={`/admin/inventory/${row.id}/edit`}
                          aria-label={`Edit ${row.name}`}
                          title={`Edit ${row.name}`}
                          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                        <InventoryDeleteButton
                          ingredientId={row.id}
                          ingredientName={row.name}
                          hasHistory={row.movementCount > 0}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          {kpis.total === 0 && !q && !supplier ? (
            <>
              <span className="mb-1 flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Plus className="size-5" aria-hidden />
              </span>
              <p className="font-heading font-bold">Belum ada bahan baku</p>
              <p className="text-sm text-muted-foreground">
                Tambahkan bahan pertama agar stok dan nilai inventaris tercatat.
              </p>
              <Link
                href="/admin/inventory/create"
                className={buttonVariants({
                  className: "mt-2 h-9 rounded-full text-sm font-bold",
                })}
              >
                Tambah Bahan
              </Link>
            </>
          ) : (
            <>
              <span className="mb-1 flex size-11 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                <Search className="size-5" aria-hidden />
              </span>
              <p className="font-heading font-bold">
                Tidak ada bahan yang cocok
              </p>
              <p className="text-sm text-muted-foreground">
                {status === "INACTIVE"
                  ? "Belum ada bahan nonaktif."
                  : "Ubah kata kunci atau filter status/supplier."}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "mt-2 h-9 cursor-pointer rounded-full text-sm font-bold",
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
            Menampilkan {showingFrom}–{showingTo} dari {total} bahan
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
