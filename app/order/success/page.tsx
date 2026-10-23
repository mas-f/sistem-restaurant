import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, ReceiptText, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { restaurant } from "@/lib/mock-data";
import { BrandLogo } from "@/components/brand-logo";
import { rupiah } from "@/lib/format";
import { prisma } from "@/lib/prisma";

async function SuccessContent({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  const sp = await searchParams;
  const orderCode = sp.id?.trim() ?? "";

  const order = orderCode
    ? await prisma.order.findUnique({
      where: { code: orderCode },
      include: {
        items: { orderBy: { id: "asc" } },
        session: { include: { table: true } },
      },
    })
    : null;

  if (!order) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center gap-5 px-6 text-center">
        <BrandLogo className="h-5" />
        <div className="flex size-20 items-center justify-center rounded-full bg-status-error-bg">
          <ReceiptText className="size-10 text-status-error-fg" aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl font-extrabold">
            Pesanan tidak ditemukan
          </h1>
          <p className="text-sm text-muted-foreground">
            Nomor pesanan mungkin salah atau tautannya sudah kedaluwarsa.
          </p>
        </div>
        <Link
          href={
            sp.token
              ? `/order/table/${encodeURIComponent(sp.token)}`
              : "/"
          }
          className="w-full"
        >
          <Button className="h-12 w-full rounded-full text-sm font-bold">
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  const tableCode = order.tableCode;
  const tableToken = order.session.table.sessionToken;

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
          <span className="tnum font-bold">{order.code}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Table className="size-4" aria-hidden /> Meja
          </span>
          <span className="font-bold">{tableCode}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" aria-hidden /> Estimasi
          </span>
          <span className="font-bold">15–20 menit</span>
        </div>

        <ul className="space-y-1 border-t border-border pt-3 text-sm">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-muted-foreground">
                <span className="tnum font-semibold text-foreground">
                  {item.quantity}×
                </span>{" "}
                {item.productName}
              </span>
              <span className="tnum shrink-0 font-semibold">
                {rupiah(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between border-t border-border pt-2 text-sm">
          <span className="font-bold">Total</span>
          <span className="tnum font-extrabold text-primary">
            {rupiah(order.total)}
          </span>
        </div>
      </div>

      <div className="animate-rise stagger-3 w-full space-y-2">
        <Link
          href={`/order/${encodeURIComponent(order.code)}?token=${encodeURIComponent(tableToken)}`}
          className="block"
        >
          <Button className="h-12 w-full rounded-full text-sm font-bold cursor-pointer">
            Lacak Pesanan
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
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent searchParams={searchParams} />
    </Suspense>
  );
}
