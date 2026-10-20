"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CircleAlert, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTableAction } from "@/lib/action";

const TABLE_CODE_MAX = 10;
const TABLE_SEATS_MAX = 50;

export function TableFormScreen({ areaSuggestions }: { areaSuggestions: string[] }) {
  const [state, formAction, pending] = useActionState(createTableAction, {});

  const [code, setCode] = useState("");
  const [seats, setSeats] = useState("");
  const [area, setArea] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Tambah Meja</h1>
        <p className="text-sm text-muted-foreground">
          Daftarkan meja baru beserta kapasitas dan areanya. Meja baru langsung
          berstatus tersedia.
        </p>
      </div>

      <form
        action={formAction}
        className="max-w-lg space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs"
      >
        {state.error ? (
          <Alert variant="destructive" className="px-3 py-2.5 text-xs">
            <CircleAlert />
            <AlertDescription className="text-xs font-medium">
              {state.error}
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Kode Meja */}
        <div className="space-y-1.5">
          <label htmlFor="code" className="block text-xs font-bold">
            Kode Meja
          </label>
          <Input
            id="code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, TABLE_CODE_MAX))}
            placeholder="Contoh: A01"
            maxLength={TABLE_CODE_MAX}
            className="h-10 rounded-lg font-mono uppercase"
            required
          />
          <p className="text-xs text-muted-foreground">
            Kode unik untuk meja ini — dipakai di struk dan QR pesanan.
          </p>
        </div>

        {/* Kapasitas Kursi */}
        <div className="space-y-1.5">
          <label htmlFor="seats" className="block text-xs font-bold">
            Kapasitas Kursi
          </label>
          <Input
            id="seats"
            name="seats"
            type="number"
            inputMode="numeric"
            min={1}
            max={TABLE_SEATS_MAX}
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            placeholder="4"
            className="h-10 w-28 rounded-lg tnum"
            required
          />
          <p className="text-xs text-muted-foreground">
            Jumlah kursi di meja ini, antara 1 dan {TABLE_SEATS_MAX}.
          </p>
        </div>

        {/* Area */}
        <div className="space-y-1.5">
          <label htmlFor="area" className="block text-xs font-bold">
            Area
          </label>
          <Input
            id="area"
            name="area"
            list="area-suggestions"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="Contoh: Indoor"
            maxLength={40}
            className="h-10 rounded-lg"
            required
          />
          <datalist id="area-suggestions">
            {areaSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
          <p className="text-xs text-muted-foreground">
            {areaSuggestions.length > 0
              ? `Pilih yang sudah ada atau ketik area baru — mis. ${areaSuggestions.join(", ")}.`
              : "Ketik nama area, mis. Indoor, Teras, atau VIP."}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button
            type="submit"
            disabled={pending}
            className="h-11 cursor-pointer rounded-lg text-sm font-bold"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Meja"
            )}
          </Button>
          <Link
            href="/admin/tables"
            className={buttonVariants({
              variant: "outline",
              className: "h-11 rounded-full text-sm font-bold",
            })}
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
