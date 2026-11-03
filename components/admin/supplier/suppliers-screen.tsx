import Link from "next/link";
import { Mail, MapPin, Pencil, Phone, Plus, Truck, UserRound } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SupplierDeleteButton } from "@/components/admin/supplier/supplier-delete-button";

export interface SupplierRow {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  ingredientCount: number;
}

export function SuppliersScreen({ suppliers }: { suppliers: SupplierRow[] }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold">Supplier</h1>
          <p className="text-sm text-muted-foreground">
            Mitra pasokan bahan baku restoran.
          </p>
        </div>
        <Link
          href="/admin/suppliers/create"
          className="flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus className="size-4" aria-hidden /> Tambah Supplier
        </Link>
      </div>

      {suppliers.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {suppliers.map((supplier) => (
            <li
              key={supplier.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-status-occupied-bg text-status-occupied-fg">
                    <Truck className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-heading font-bold">{supplier.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {supplier.contact || "Tanpa kontak"}
                    </p>
                  </div>
                </div>
                <span
                  className={
                    supplier.isActive
                      ? "rounded-full bg-status-available-bg px-2 py-0.5 text-[11px] font-bold text-status-available-fg"
                      : "rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground"
                  }
                >
                  {supplier.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              <div className="space-y-1 text-sm text-muted-foreground">
                {supplier.phone ? (
                  <p className="tnum flex items-center gap-2">
                    <Phone className="size-3.5 shrink-0" aria-hidden />
                    {supplier.phone}
                  </p>
                ) : null}
                {supplier.email ? (
                  <p className="flex items-center gap-2 break-all">
                    <Mail className="size-3.5 shrink-0" aria-hidden />
                    {supplier.email}
                  </p>
                ) : null}
                {supplier.address ? (
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    {supplier.address}
                  </p>
                ) : null}
                {!supplier.phone && !supplier.email && !supplier.address ? (
                  <p className="flex items-center gap-2 text-xs">
                    <UserRound className="size-3.5" aria-hidden />
                    Belum ada detail kontak.
                  </p>
                ) : null}
              </div>

              <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2.5">
                <p className="text-xs text-muted-foreground">
                  {supplier.ingredientCount} bahan terhubung
                </p>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/suppliers/${supplier.id}/edit`}
                    aria-label={`Edit supplier ${supplier.name}`}
                    title={`Edit supplier ${supplier.name}`}
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </Link>
                  <SupplierDeleteButton
                    supplierId={supplier.id}
                    supplierName={supplier.name}
                    ingredientCount={supplier.ingredientCount}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <span className="mb-1 flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Plus className="size-5" aria-hidden />
          </span>
          <p className="font-heading font-bold">Belum ada supplier</p>
          <p className="text-sm text-muted-foreground">
            Tambahkan supplier agar bahan baku bisa dihubungkan ke pemasoknya.
          </p>
          <Link
            href="/admin/suppliers/create"
            className={buttonVariants({
              className: "mt-2 h-9 rounded-full text-sm font-bold",
            })}
          >
            Tambah Supplier
          </Link>
        </div>
      )}
    </div>
  );
}
