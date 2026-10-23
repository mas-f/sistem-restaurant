import { Suspense } from "react";
import { OrderTrackingScreen } from "@/components/customer/order-tracking-screen";
import { toUiOrder } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

async function TrackingContent({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderId } = await params;
  const sp = await searchParams;
  const decoded = decodeURIComponent(orderId);

  const order = await prisma.order.findFirst({
    where: { OR: [{ code: decoded }, { id: decoded }] },
    include: {
      items: { orderBy: { id: "asc" } },
      session: { include: { table: true } },
    },
  });

  // Token meja diambil dari sesi order (otoritatif); query token hanya
  // fallback untuk tautan lama.
  const tableToken = order?.session.table.sessionToken ?? sp.token ?? "";

  return (
    <OrderTrackingScreen
      order={order ? toUiOrder(order) : null}
      tableToken={tableToken}
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
