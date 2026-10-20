"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search } from "lucide-react";
import { categories, products, rupiah } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function MenuAdminScreen() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const list = products.filter((p) => {
    if (cat !== "all" && p.categoryId !== cat) return false;
    const query = q.trim().toLowerCase();
    if (query && !p.name.toLowerCase().includes(query)) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Menu</h1>
          <p className="text-sm text-muted-foreground">
            {products.length} produk terdaftar.
          </p>
        </div>
        <Link
          href="/admin/menu/create"
          className="flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus className="size-4" aria-hidden /> Tambah Produk
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari produk…"
            aria-label="Cari produk"
            className="h-9 w-full rounded-full border border-border bg-card pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCat("all")}
            aria-pressed={cat === "all"}
            className={cn(
              "h-8 rounded-full border px-3 text-xs font-bold",
              cat === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-accent/50"
            )}
          >
            Semua
          </button>
          {categories
            .filter((c) => c.id !== "cat-1")
            .map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                aria-pressed={cat === c.id}
                className={cn(
                  "h-8 rounded-full border px-3 text-xs font-bold",
                  cat === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-accent/50"
                )}
              >
                {c.name}
              </button>
            ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-left text-xs font-bold tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-2.5">Produk</th>
              <th className="px-4 py-2.5">Kategori</th>
              <th className="px-4 py-2.5 text-right">Harga</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/40">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    <span className="text-xl" aria-hidden>
                      {p.imageEmoji}
                    </span>
                    <span>
                      <span className="block font-semibold">{p.name}</span>
                      <span className="block max-w-md truncate text-xs text-muted-foreground">
                        {p.description}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {categories.find((c) => c.id === p.categoryId)?.name}
                </td>
                <td className="tnum px-4 py-3 text-right font-bold">
                  {rupiah(p.price)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold",
                      p.available
                        ? "bg-status-available-bg text-status-available-fg"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "size-1.5 rounded-full",
                        p.available ? "bg-status-available" : "bg-muted-foreground"
                      )}
                    />
                    {p.available ? "Tersedia" : "Habis"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    aria-label={`Edit ${p.name}`}
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <Pencil className="size-3.5" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
