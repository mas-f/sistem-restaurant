"use client";

import { Building2, Palette, Store } from "lucide-react";
import { branches, restaurant } from "@/lib/mock-data";

export function SettingsScreen() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Profil restoran, cabang, dan preferensi tampilan.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading mb-4 flex items-center gap-2 text-sm font-extrabold">
          <Store className="size-4 text-primary" aria-hidden /> Profil Restoran
        </h2>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Nama</dt>
            <dd className="font-bold">{restaurant.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Tagline</dt>
            <dd className="font-bold">{restaurant.tagline}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading mb-4 flex items-center gap-2 text-sm font-extrabold">
          <Building2 className="size-4 text-primary" aria-hidden /> Cabang
        </h2>
        <ul className="space-y-3">
          {branches.map((b) => (
            <li
              key={b.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-border p-3"
            >
              <div>
                <p className="font-semibold">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.address}</p>
              </div>
              <span className="rounded-full bg-status-available-bg px-2 py-0.5 text-xs font-bold text-status-available-fg">
                Aktif
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-heading mb-4 flex items-center gap-2 text-sm font-extrabold">
          <Palette className="size-4 text-primary" aria-hidden /> Tema
        </h2>
        <p className="text-sm text-muted-foreground">
          Tema terang (porcelain) aktif untuk seluruh layar staff &amp; admin.
          Mode gelap menyusul di tahap polish.
        </p>
      </section>
    </div>
  );
}
