"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  QrCode,
  ReceiptText,
  Search,
  Smartphone,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { BrandLogo } from "@/components/brand-logo";
import { SignOutButton } from "@/components/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { restaurant, rupiah, staff } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import type { PaymentMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

const methods: { key: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { key: "QRIS", label: "QRIS", icon: QrCode },
  { key: "CASH", label: "Tunai", icon: Banknote },
  { key: "DEBIT", label: "Debit", icon: CreditCard },
  { key: "CREDIT", label: "Kredit", icon: CreditCard },
  { key: "EWALLET", label: "E-Wallet", icon: Smartphone },
];

const filterTabs = [
  { key: "ALL", label: "Semua Meja" },
  { key: "OCCUPIED", label: "Terisi" },
  { key: "WAITING_PAYMENT", label: "Minta Bill" },
  { key: "AVAILABLE", label: "Kosong" },
] as const;

export function CashierScreen() {
  const {
    tables,
    sessions,
    orders,
    payTable,
    setBillStatus,
    openTable,
    toast,
  } = useStore();
  const [filter, setFilter] = useState<(typeof filterTabs)[number]["key"]>("ALL");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("QRIS");
  const [received, setReceived] = useState("");
  const [paid, setPaid] = useState(false);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const cashier = staff.find((s) => s.role === "KASIR" && s.active);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tables.filter((t) => {
      if (filter !== "ALL" && t.status !== filter) return false;
      if (q && !t.code.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tables, filter, query]);

  const selected = tables.find((t) => t.id === selectedId) ?? null;
  const session =
    selected && sessions.find((s) => s.tableId === selected.id);
  const tableOrders = selected
    ? orders.filter(
        (o) =>
          o.tableCode === selected.code && o.status !== "CANCELLED"
      )
    : [];

  const subtotal = tableOrders.reduce(
    (s, o) =>
      s +
      o.items.reduce(
        (x, i) => x + (i.unitPrice + i.modifierDelta) * i.quantity,
        0
      ),
    0
  );
  const service = Math.round(subtotal * 0.05);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + service + tax;
  const receivedNum = Number(received.replace(/\D/g, "")) || 0;
  const change = Math.max(0, receivedNum - total);

  const handlePay = () => {
    if (!selected) return;
    payTable(selected.id, method);
    setPaid(true);
    setPayOpen(false);
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
          <BrandLogo className="h-7 shrink-0" />
          <div>
            <h1 className="font-heading text-base leading-tight font-extrabold">
              Kasir &amp; Billing
            </h1>
            <p className="text-xs text-muted-foreground">
              {cashier ? `${cashier.name} · Shift ${cashier.shift}` : restaurant.name}
            </p>
          </div>

          <div className="relative ml-auto w-full sm:w-52">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari meja…"
              aria-label="Cari meja"
              className="h-9 w-full rounded-full border border-border bg-background pr-3 pl-9 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            />
          </div>

          <SignOutButton />
        </div>

        <div
          role="tablist"
          aria-label="Filter status meja"
          className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2 lg:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filterTabs.map((f) => {
            const on = f.key === filter;
            const n =
              f.key === "ALL"
                ? tables.length
                : tables.filter((t) => t.status === f.key).length;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold whitespace-nowrap transition",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  on
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-accent/50"
                )}
              >
                {f.label}
                <span className="tnum opacity-70">{n}</span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_400px] lg:px-6">
        {/* Table grid */}
        <main>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
              <Users className="size-7 text-muted-foreground" aria-hidden />
              <p className="font-heading font-bold">Tidak ada meja</p>
              <p className="text-sm text-muted-foreground">
                Tidak ada meja yang cocok dengan filter “{filter}”.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((t, i) => {
                const on = t.id === selectedId;
                const sess = sessions.find((s) => s.tableId === t.id);
                const mins = sess
                  ? Math.max(
                      0,
                      Math.floor(
                        (now - new Date(sess.startedAt).getTime()) / 60000
                      )
                    )
                  : 0;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedId(on ? null : t.id);
                      setPaid(false);
                    }}
                    aria-pressed={on}
                    className={cn(
                      "animate-rise rounded-xl border bg-card p-3 text-left transition",
                      "shadow-[0_2px_4px_-1px_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)]",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      on
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:-translate-y-0.5 hover:border-primary/40"
                    )}
                    style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading text-lg font-extrabold">
                        {t.code}
                      </span>
                      <StatusBadge status={t.status} compact />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="size-3" aria-hidden />
                      {t.seats} kursi · {t.area}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        <StatusBadge status={t.status} className="bg-transparent p-0" />
                      </span>
                      {sess && (
                        <span className="tnum shrink-0 whitespace-nowrap text-xs font-bold text-muted-foreground">
                          {mins} mnt
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </main>

        {/* Bill panel */}
        <aside className="lg:sticky lg:top-32 lg:self-start">
          {!selected ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-14 text-center">
              <ReceiptText className="size-7 text-muted-foreground" aria-hidden />
              <p className="font-heading font-bold">Pilih meja</p>
              <p className="max-w-[16rem] text-sm text-muted-foreground">
                Klik salah satu meja untuk melihat order aktif dan total tagihan.
              </p>
            </div>
          ) : (
            <div className="animate-rise rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-heading text-lg font-extrabold">
                    Tagihan Meja {selected.code}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {tableOrders.length} order aktif
                  </p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              {tableOrders.length === 0 ? (
                <p className="mt-4 rounded-lg bg-muted px-3 py-6 text-center text-sm text-muted-foreground">
                  Belum ada order di meja ini.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {tableOrders.map((o) => (
                    <li
                      key={o.id}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="tnum text-xs font-bold text-muted-foreground">
                          {o.code}
                        </span>
                        <StatusBadge status={o.status} compact />
                      </div>
                      <ul className="mt-2 space-y-1">
                        {o.items.map((it) => (
                          <li
                            key={it.id}
                            className="flex items-baseline justify-between gap-2 text-sm"
                          >
                            <span className="min-w-0 truncate">
                              <span className="tnum font-bold">
                                {it.quantity}×
                              </span>{" "}
                              {it.productName}
                            </span>
                            <span className="tnum shrink-0 font-semibold">
                              {rupiah(
                                (it.unitPrice + it.modifierDelta) * it.quantity
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}

              <dl className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tnum font-semibold">{rupiah(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Service (5%)</dt>
                  <dd className="tnum font-semibold">{rupiah(service)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pajak (10%)</dt>
                  <dd className="tnum font-semibold">{rupiah(tax)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base">
                  <dt className="font-bold">Total</dt>
                  <dd className="tnum font-extrabold text-primary">
                    {rupiah(total)}
                  </dd>
                </div>
              </dl>

              {session?.billStatus === "REQUESTED" && (
                <p className="mt-3 flex items-center gap-2 rounded-lg bg-status-waiting-bg px-3 py-2 text-xs font-bold text-status-waiting-fg">
                  <ReceiptText className="size-4 shrink-0" aria-hidden />
                  Tamu meminta tagihan
                </p>
              )}

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  onClick={() => setPayOpen(true)}
                  disabled={total === 0 || paid}
                  className="h-11 w-full rounded-full text-sm font-bold"
                >
                  {paid ? "Sudah Dibayar ✓" : `Proses Pembayaran · ${rupiah(total)}`}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="h-9 flex-1 rounded-full text-xs font-bold"
                    disabled={session?.billStatus === "REQUESTED"}
                    onClick={() => {
                      setBillStatus(selected.id, "REQUESTED");
                      toast({
                        title: "Status: Menunggu Bayar",
                        description: `Meja ${selected.code} ditandai menunggu pembayaran.`,
                        tone: "warning",
                      });
                    }}
                  >
                    Tandai Minta Bill
                  </Button>
                  {selected.status === "AVAILABLE" && (
                    <Button
                      variant="outline"
                      className="h-9 flex-1 rounded-full text-xs font-bold"
                      onClick={() => openTable(selected.id)}
                    >
                      Buka Sesi
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Payment dialog (PRD §10) */}
      <Dialog
        open={payOpen}
        onOpenChange={(o) => {
          setPayOpen(o);
          if (!o) setPaid(false);
        }}
      >
        <DialogContent className="gap-5 sm:max-w-md">
          <div>
            <DialogTitle className="font-heading text-lg font-extrabold">
              Pembayaran Meja {selected?.code}
            </DialogTitle>
            <DialogDescription>
              Pilih metode pembayaran untuk menutup sesi meja ini.
            </DialogDescription>
          </div>

          <div className="rounded-lg bg-secondary px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground">
              Total Tagihan
            </p>
            <p className="tnum font-heading text-2xl font-extrabold text-primary">
              {rupiah(total)}
            </p>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-bold">
              Metode Pembayaran
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => {
                const Icon = m.icon;
                const on = m.key === method;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMethod(m.key)}
                    aria-pressed={on}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-bold transition",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      on
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent/40"
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {method === "CASH" && (
            <div>
              <label
                htmlFor="received"
                className="mb-1.5 block text-sm font-bold"
              >
                Uang Diterima
              </label>
              <input
                id="received"
                inputMode="numeric"
                value={received}
                onChange={(e) =>
                  setReceived(e.target.value.replace(/\D/g, ""))
                }
                placeholder="0"
                className="tnum h-11 w-full rounded-lg border border-input bg-card px-3 text-base font-semibold focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              />
              <div className="mt-2 flex justify-between rounded-lg bg-secondary px-3 py-2 text-sm">
                <span className="text-muted-foreground">Kembalian</span>
                <span className="tnum font-bold">{rupiah(change)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              Batal
            </Button>
            <Button
              onClick={handlePay}
              disabled={method === "CASH" && receivedNum < total}
              className="font-bold"
            >
              <Wallet className="size-4" aria-hidden />
              Selesaikan Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment success */}
      <Dialog open={paid} onOpenChange={setPaid}>
        <DialogContent className="sm:max-w-sm">
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-status-available-bg">
              <CheckCircle2 className="size-8 text-status-available-fg" aria-hidden />
            </span>
            <DialogTitle className="font-heading text-lg font-extrabold">
              Pembayaran Berhasil
            </DialogTitle>
            <DialogDescription>
              Meja {selected?.code} telah ditutup dan kembali tersedia.
              Struk tercetak otomatis.
            </DialogDescription>
            <p className="tnum text-sm font-semibold">
              {rupiah(total)} · {methods.find((m) => m.key === method)?.label}
            </p>
          </div>
          <DialogFooter>
            <Button
              className="w-full font-bold"
              onClick={() => {
                setPaid(false);
                setSelectedId(null);
              }}
            >
              <X className="size-4" aria-hidden /> Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
