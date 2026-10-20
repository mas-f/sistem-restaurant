"use client";

import { Copy, Printer, QrCode } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

export interface QrTable {
  id: string;
  code: string;
  area: string;
  url: string;
  svg: string;
}

export function QrTablesScreen({ tables }: { tables: QrTable[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (table: QrTable) => {
    try {
      await navigator.clipboard.writeText(table.url);
      setCopied(table.id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <BrandLogo className="mb-3 h-5" />
        <h1 className="font-heading text-2xl font-extrabold">QR Meja</h1>
        <p className="text-sm text-muted-foreground">
          Cetak QR untuk setiap meja. Arahkan kamera untuk membuka menu.
        </p>
      </div>

      {tables.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {tables.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center"
            >
              {/* SVG dari lib/qrcode.ts — QR valid yang bisa dipindai kamera. */}
              <div
                className="size-32 rounded bg-white [&>svg]:size-full"
                dangerouslySetInnerHTML={{ __html: t.svg }}
                role="img"
                aria-label={`QR kode meja ${t.code}`}
              />
              <figcaption>
                <p className="font-heading text-lg font-extrabold">
                  Meja {t.code}
                </p>
                <p className="text-xs text-muted-foreground">{t.area}</p>
              </figcaption>
              <div className="flex gap-1.5">
                <button
                  onClick={() => copy(t)}
                  className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
                  aria-label={`Salin tautan QR meja ${t.code}`}
                >
                  <Copy className="size-3.5" aria-hidden />
                  {copied === t.id ? "Tersalin" : "Salin"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer"
                  aria-label={`Cetak QR meja ${t.code}`}
                >
                  <Printer className="size-3.5" aria-hidden />
                  Cetak
                </button>
              </div>
            </figure>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Belum ada meja. Tambahkan meja dulu di halaman Meja, QR-nya otomatis
          muncul di sini.
        </p>
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <QrCode className="size-4" aria-hidden />
        QR valid dari token meja di database — hasil pindai membuka menu meja
        tersebut.
      </p>
    </div>
  );
}
