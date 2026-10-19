import { Suspense } from "react";
import { OrderTrackingScreen } from "@/components/customer/order-tracking-screen";
import { tables } from "@/lib/mock-data";

async function TrackingContent({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const table = tables.find((t) => t.sessionToken) ?? tables[0];

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
}: {
  params: Promise<{ orderId: string }>;
}) {
  return (
    <Suspense fallback={<TrackingFallback />}>
      <TrackingContent params={params} />
    </Suspense>
  );
}
