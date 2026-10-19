"use client";

import { Copy, Printer, QrCode } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { BrandLogo } from "@/components/brand-logo";

// QR "digambar" dari modul pola deterministik per kode meja.
function QrPattern({ seed, size = 128 }: { seed: string; size?: number }) {
  const cells = 21;
  const px = size / cells;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const dots: { x: number; y: number }[] = [];
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      h = (h * 1103515245 + 12345) >>> 0;
      const finder =
        (x < 7 && y < 7) ||
        (x >= cells - 7 && y < 7) ||
        (x < 7 && y >= cells - 7);
      if (finder) continue;
      if ((h >> 16) % 100 < 46) dots.push({ x, y });
    }
  }
  const finder = (ox: number, oy: number) => (
    <g key={`${ox}-${oy}`}>
      <rect x={ox * px} y={oy * px} width={7 * px} height={7 * px} fill="none" stroke="#0f172a" strokeWidth={px} />
      <rect x={(ox + 2) * px} y={(oy + 2) * px} width={3 * px} height={3 * px} fill="#0f172a" />
    </g>
  );
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`QR kode meja ${seed}`}
      className="rounded bg-white"
    >
      <rect width={size} height={size} fill="#ffffff" />
      {dots.map((d, i) => (
        <rect
          key={i}
          x={d.x * px}
          y={d.y * px}
          width={px}
          height={px}
          fill="#0f172a"
        />
      ))}
      {finder(0, 0)}
      {finder(14, 0)}
      {finder(0, 14)}
    </svg>
  );
}

export function QrTablesScreen() {
  const { tables } = useStore();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (code: string, token: string) => {
    const url = `${location.origin}/order/table/${encodeURIComponent(token || code)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(code);
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {tables.map((t) => (
          <figure
            key={t.id}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center"
          >
            <QrPattern seed={t.sessionToken || t.code} />
            <figcaption>
              <p className="font-heading text-lg font-extrabold">
                Meja {t.code}
              </p>
              <p className="text-xs text-muted-foreground">{t.area}</p>
            </figcaption>
            <div className="flex gap-1.5">
              <button
                onClick={() => copy(t.code, t.sessionToken)}
                className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`Salin tautan QR meja ${t.code}`}
              >
                <Copy className="size-3.5" aria-hidden />
                {copied === t.code ? "Tersalin" : "Salin"}
              </button>
              <button
                onClick={() => window.print()}
                className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`Cetak QR meja ${t.code}`}
              >
                <Printer className="size-3.5" aria-hidden />
                Cetak
              </button>
            </div>
          </figure>
        ))}
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <QrCode className="size-4" aria-hidden />
        QR demo dibangkitkan dari token sesi (bukan QR produksi).
      </p>
    </div>
  );
}
