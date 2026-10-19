"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Menu as MenuIcon,
  Package,
  Tags,
  Truck,
  Users,
  X,
  CalendarClock,
  Settings,
  QrCode,
} from "lucide-react";
import { restaurant } from "@/lib/mock-data";
import { BrandLogo } from "@/components/brand-logo";
import { SignOutButton } from "@/components/sign-out-button";
import { cn } from "@/lib/utils";

const groups: {
  label: string;
  items: { href: string; label: string; icon: typeof Users }[];
}[] = [
  {
    label: "Ringkasan",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/orders", label: "Orders", icon: ClipboardList },
      { href: "/admin/sales", label: "Sales", icon: BarChart3 },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    label: "Meja & Menu",
    items: [
      { href: "/admin/tables", label: "Meja", icon: Users },
      { href: "/admin/tables/qr", label: "QR Meja", icon: QrCode },
      { href: "/admin/menu", label: "Menu", icon: MenuIcon },
      { href: "/admin/categories", label: "Kategori", icon: Tags },
    ],
  },
  {
    label: "Operasional",
    items: [
      { href: "/admin/inventory", label: "Inventaris", icon: Package },
      { href: "/admin/suppliers", label: "Supplier", icon: Truck },
      { href: "/admin/staff", label: "Staff", icon: Users },
      { href: "/admin/shifts", label: "Shift", icon: CalendarClock },
      { href: "/admin/settings", label: "Pengaturan", icon: Settings },
    ],
  },
];

export function AdminShell({
  children,
  identity,
}: {
  children: React.ReactNode;
  identity?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <BrandLogo className="h-7 shrink-0" />
        <span>
          <span className="block font-heading text-sm leading-tight font-extrabold text-sidebar-foreground">
            {restaurant.name}
          </span>
          <span className="block text-[11px] text-sidebar-foreground/60">
            Admin Panel
          </span>
        </span>
      </Link>

      {groups.map((g) => (
        <div key={g.label}>
          <p className="mb-1.5 px-2 text-[11px] font-bold tracking-wider text-sidebar-foreground/50 uppercase">
            {g.label}
          </p>
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active =
                it.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(it.href);
              const Icon = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="mt-auto space-y-2.5 rounded-lg bg-sidebar-accent p-3">
        <div>
          <p className="text-xs font-bold text-sidebar-accent-foreground">
            Cabang Senopati
          </p>
          <p className="mt-0.5 text-[11px] text-sidebar-foreground/60">
            {identity ?? "Admin"}
          </p>
        </div>
        <SignOutButton className="w-full" />
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Tutup menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-sidebar shadow-xl">
            <button
              aria-label="Tutup menu"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-sidebar-foreground hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-5" aria-hidden />
            </button>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            aria-label="Buka menu navigasi"
            onClick={() => setOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg border border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <MenuIcon className="size-5" aria-hidden />
          </button>
          <span className="font-heading text-sm font-extrabold">
            Admin Panel
          </span>
        </header>

        <main className="min-w-0 flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
