import Link from "next/link";
import { Pencil, Plus, Users } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { TableDeleteButton } from "@/components/admin/table/table-delete-button";
import type { DiningTable } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TablesScreen({ tables }: { tables: DiningTable[] }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Meja</h1>
          <p className="tnum text-sm text-muted-foreground">
            {tables.length} meja terdaftar.
          </p>
        </div>
        <Link
          href="/admin/tables/create"
          className="flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus className="size-4" aria-hidden /> Tambah Meja
        </Link>
      </div>

      {tables.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {tables.map((t, i) => (
            <div
              key={t.id}
              className={cn(
                "animate-rise rounded-xl border border-border bg-card p-4",
                `stagger-${Math.min(i % 5, 4)}`
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-extrabold">
                  {t.code}
                </span>
                <span className="flex items-center gap-1">
                  <StatusBadge status={t.status} compact />
                  <Link
                    href={`/admin/tables/${t.id}/edit`}
                    aria-label={`Edit meja ${t.code}`}
                    title={`Edit meja ${t.code}`}
                    className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <Pencil className="size-3.5" aria-hidden />
                  </Link>
                  <TableDeleteButton tableId={t.id} tableCode={t.code} />
                </span>
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5" aria-hidden />
                {t.seats} kursi · {t.area}
              </p>
              <div className="mt-3">
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="mb-1 flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Plus className="size-5" aria-hidden />
          </span>
          <p className="font-heading font-bold">Belum ada meja</p>
          <p className="text-sm text-muted-foreground">
            Daftarkan meja pertama agar tamu bisa memesan.
          </p>
          <Link
            href="/admin/tables/create"
            className={buttonVariants({
              className: "mt-2 h-9 rounded-full text-sm font-bold",
            })}
          >
            Tambah Meja
          </Link>
        </div>
      )}
    </div>
  );
}
