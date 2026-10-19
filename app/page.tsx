import Link from "next/link";
import {
  ArrowRight,
  Flame,
  QrCode,
  ReceiptText,
  LayoutDashboard,
} from "lucide-react";
import { restaurant, tables } from "@/lib/mock-data";
import { BrandLogo } from "@/components/brand-logo";

const roles = [
  {
    href: `/order/table/${encodeURIComponent(tables[0].sessionToken || tables[0].code)}`,
    title: "Customer QR Order",
    desc: `Pindai QR, pesan dari meja ${tables[0].code}, lacak, minta tagihan.`,
    icon: QrCode,
    accent: "bg-primary text-primary-foreground",
  },
  {
    href: "/staff/kitchen",
    title: "Kitchen Display",
    desc: "4 kolom status, timer tiket, filter stasiun.",
    icon: Flame,
    accent: "bg-status-waiting text-white",
  },
  {
    href: "/staff/cashier",
    title: "Kasir & Billing",
    desc: "Pilih meja, lihat tagihan, proses pembayaran.",
    icon: ReceiptText,
    accent: "bg-status-available text-white",
  },
  {
    href: "/admin",
    title: "Admin & Analytics",
    desc: "Dashboard, menu, inventaris, staff, laporan.",
    icon: LayoutDashboard,
    accent: "bg-foreground text-background",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center gap-8 px-5 py-12">
      <header className="animate-rise space-y-2 text-center">
        <BrandLogo className="mx-auto h-12" />
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">
          {restaurant.name}
        </h1>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          Prototype sistem QR ordering &amp; POS — pilih peran untuk mulai.
          Semua data demo, tanpa backend.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {roles.map((r, i) => {
          const Icon = r.icon;
          return (
            <li key={r.href} className={`animate-rise stagger-${Math.min(i, 4)}`}>
              <Link
                href={r.href}
                className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span
                  className={`flex size-10 items-center justify-center rounded-lg ${r.accent}`}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="flex items-center gap-1.5 font-heading font-extrabold">
                    {r.title}
                    <ArrowRight
                      className="size-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {r.desc}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="text-center text-xs text-muted-foreground">
        Mode prototype · data mock konsisten lintas halaman
      </p>
    </div>
  );
}
