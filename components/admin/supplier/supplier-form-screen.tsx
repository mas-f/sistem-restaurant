"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CircleAlert, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSupplierAction, updateSupplierAction } from "@/lib/action";

export interface SupplierFormData {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

export function SupplierFormScreen({
  supplier,
}: {
  supplier?: SupplierFormData;
}) {
  const isEdit = Boolean(supplier);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateSupplierAction : createSupplierAction,
    {}
  );

  const [name, setName] = useState(supplier?.name ?? "");
  const [contact, setContact] = useState(supplier?.contact ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [email, setEmail] = useState(supplier?.email ?? "");
  const [address, setAddress] = useState(supplier?.address ?? "");
  const [isActive, setIsActive] = useState(supplier?.isActive ?? true);

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/admin/suppliers"
          className="text-xs font-bold text-muted-foreground hover:text-primary hover:underline"
        >
          ← Kembali ke supplier
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-extrabold">
          {isEdit ? "Edit Supplier" : "Tambah Supplier"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Perbarui data kontak atau status supplier ini."
            : "Daftarkan mitra pasokan bahan baku beserta detail kontaknya."}
        </p>
      </div>

      <form
        action={formAction}
        className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs"
      >
        {isEdit ? <input type="hidden" name="id" value={supplier!.id} /> : null}

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
            Nama Supplier
          </label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Contoh: Segar Tani Sayur"
            maxLength={80}
            className="h-10 rounded-lg"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="contact" className="block text-xs font-bold">
              Kontak Person
            </label>
            <Input
              id="contact"
              name="contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              placeholder="Nama PIC"
              maxLength={80}
              className="h-10 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-xs font-bold">
              Telepon
            </label>
            <Input
              id="phone"
              name="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0812-3456-7890"
              maxLength={30}
              className="h-10 rounded-lg tnum"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-bold">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="supplier@contoh.com"
            maxLength={120}
            className="h-10 rounded-lg"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="address" className="block text-xs font-bold">
            Alamat
          </label>
          <Textarea
            id="address"
            name="address"
            value={address}
            onChange={(event) => setAddress(event.target.value.slice(0, 200))}
            rows={3}
            maxLength={200}
            placeholder="Alamat gudang atau kantor supplier"
            className="rounded-lg text-sm"
          />
        </div>

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
              <span className="text-sm font-semibold">Supplier aktif</span>
              <span className="text-xs text-muted-foreground">
                Hanya supplier aktif yang muncul di form bahan.
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
              "Tambah Supplier"
            )}
          </Button>
          <Link
            href="/admin/suppliers"
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
