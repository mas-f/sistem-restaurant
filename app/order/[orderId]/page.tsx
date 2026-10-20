import { Suspense } from "react";
import { OrderTrackingScreen } from "@/components/customer/order-tracking-screen";
import { fallbackMockTable, resolveTableByToken } from "@/lib/resolve-table";

async function TrackingContent({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderId } = await params;
  const sp = await searchParams;
  // Token dibawa dari keranjang (…?token=) agar "Kembali ke Menu" membuka
  // meja yang benar; tanpa token, tautan lama jatuh ke fallback demo.
  const table = (await resolveTableByToken(sp.token)) ?? fallbackMockTable();

  return (
    <OrderTrackingScreen
      orderId={decodeURIComponent(orderId)}
      tableToken={table.sessionToken || table.code}
    />
  );
}

function TrackingFallback() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg animate-pulse space-y-4 px-4 py-6">
      <div className="h-24 rounded-xl bg-muted" />
      <div className="h-64 rounded-xl bg-muted" />
      <div className="h-40 rounded-xl bg-muted" />
    </div>
  );
}

export default function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense fallback={<TrackingFallback />}>
      <TrackingContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
