"use client";

import Image from "next/image";
import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Gambar produk dari Supabase Storage dengan fallback yang tetap rapi saat
 * URL kosong atau berkas gagal dimuat. Parent wajib `relative` karena memakai
 * `fill`.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex size-full items-center justify-center bg-gradient-to-br from-secondary to-accent/40">
        <UtensilsCrossed
          className="size-8 text-muted-foreground/60"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
