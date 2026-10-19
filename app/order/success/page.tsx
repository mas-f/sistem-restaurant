import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tables, restaurant } from "@/lib/mock-data";
import { BrandLogo } from "@/components/brand-logo";

async function SuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; table?: string }>;
}) {
  const sp = await searchParams;
  const tableCode = sp.table ?? "A01";
  const orderId = sp.id ?? "ORD-20261006-001";
  const table = tables.find((t) => t.sessionToken) ?? tables[0];

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
      <BrandLogo className="h-5" />
      <div className="animate-rise flex size-20 items-center justify-center rounded-full bg-status-available-bg">
        <CheckCircle2 className="size-10 text-status-available-fg" aria-hidden />
      </div>

      <div className="animate-rise stagger-1 space-y-2">
        <h1 className="font-heading text-2xl font-extrabold">
          Pesanan Berhasil!
        </h1>
        <p className="text-sm text-muted-foreground">
          Dapur sudah menerima pesananmu.
        </p>
      </div>

      <div className="animate-rise stagger-2 w-full space-y-3 rounded-xl border border-border bg-card p-4 text-left shadow-xs">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <ReceiptText className="size-4" aria-hidden /> Nomor pesanan
          </span>
          <span className="tnum font-bold">{orderId}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Meja</span>
          <span className="font-bold">{tableCode}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" aria-hidden /> Estimasi
          </span>
          <span className="font-bold">15–20 menit</span>
        </div>
      </div>

      <div className="animate-rise stagger-3 w-full space-y-2">
        <Link href={`/order/${encodeURIComponent(orderId)}`} className="block">
          <Button className="h-12 w-full rounded-full text-sm font-bold">
            Lacak Pesanan
          </Button>
        </Link>
        <Link
          href={`/order/table/${encodeURIComponent(table.sessionToken || table.code)}`}
          className="block"
        >
          <Button
            variant="outline"
            className="h-12 w-full rounded-full text-sm font-bold"
          >
            Kembali ke Menu
          </Button>
        </Link>
      </div>

      <p className="animate-rise stagger-4 text-xs text-muted-foreground">
        {restaurant.name}
      </p>
    </div>
  );
}

function SuccessFallback() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg animate-pulse flex-col items-center justify-center gap-4 px-6">
      <div className="size-20 rounded-full bg-muted" />
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="h-32 w-full rounded-xl bg-muted" />
    </div>
  );
}

export default function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; table?: string }>;
}) {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
