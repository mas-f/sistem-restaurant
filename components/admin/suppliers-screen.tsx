"use client";

import { Phone, Truck } from "lucide-react";
import { ingredients, suppliers } from "@/lib/mock-data";

export function SuppliersScreen() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Supplier</h1>
        <p className="text-sm text-muted-foreground">
          Mitra pasokan bahan baku restoran.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {suppliers.map((s) => {
          const items = ingredients.filter((i) => i.supplierId === s.id);
          return (
            <li
              key={s.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-status-occupied-bg text-status-occupied-fg">
                  <Truck className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-heading font-bold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.contact}</p>
                </div>
              </div>
              <p className="tnum flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="size-3.5" aria-hidden />
                {s.phone}
              </p>
              <p className="border-t border-border pt-2 text-xs text-muted-foreground">
                {items.length} bahan:{" "}
                <span className="text-foreground">
                  {items.map((i) => i.name).join(", ") || "—"}
                </span>
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
