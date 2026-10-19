"use client";

import { AlertTriangle, Package } from "lucide-react";
import { ingredients, suppliers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function InventoryScreen() {
  const low = ingredients.filter((i) => i.stock < i.minStock).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Inventaris</h1>
          <p className="text-sm text-muted-foreground">
            Stok bahan baku &amp; ambang batas pemesanan ulang.
          </p>
        </div>
        {low > 0 && (
          <span className="inline-flex items-center gap-2 rounded-full bg-status-error-bg px-3 py-1.5 text-sm font-bold text-status-error-fg">
            <AlertTriangle className="size-4" aria-hidden />
            {low} bahan kritis
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2.5">Bahan</th>
              <th className="px-4 py-2.5">Supplier</th>
              <th className="px-4 py-2.5 w-56">Stok</th>
              <th className="px-4 py-2.5 text-right">Min.</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ingredients.map((ing) => {
              const critical = ing.stock < ing.minStock;
              const pct = Math.min(100, (ing.stock / (ing.minStock * 1.5)) * 100);
              const sup = suppliers.find((s) => s.id === ing.supplierId);
              return (
                <tr key={ing.id} className="hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-semibold">
                      <Package
                        className={cn(
                          "size-4",
                          critical ? "text-status-error-fg" : "text-muted-foreground"
                        )}
                        aria-hidden
                      />
                      {ing.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {sup?.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        role="progressbar"
                        aria-valuenow={Math.round(pct)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
                      >
                        <div
                          className={cn(
                            "h-full rounded-full",
                            critical ? "bg-status-error" : "bg-status-available"
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="tnum w-20 text-right text-xs font-bold">
                        {ing.stock} {ing.unit}
                      </span>
                    </div>
                  </td>
                  <td className="tnum px-4 py-3 text-right text-muted-foreground">
                    {ing.minStock} {ing.unit}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                        critical
                          ? "bg-status-error-bg text-status-error-fg"
                          : "bg-status-available-bg text-status-available-fg"
                      )}
                    >
                      <AlertTriangle className="size-3" aria-hidden />
                      {critical ? "Restock" : "Aman"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
