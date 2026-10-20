import { Suspense } from "react";
import { CartScreen } from "@/components/customer/cart-screen";
import { fallbackMockTable, resolveTableByToken } from "@/lib/resolve-table";

async function CartContent({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  // Token QR dari database; tautan tanpa token jatuh ke fallback demo.
  const table = (await resolveTableByToken(sp.token)) ?? fallbackMockTable();

  return (
    <CartScreen
      tableCode={table.code}
      tableToken={table.sessionToken || table.code}
    />
  );
}

function CartFallback() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg animate-pulse space-y-3 px-4 py-6">
      <div className="h-12 rounded-xl bg-muted" />
      <div className="h-32 rounded-xl bg-muted" />
      <div className="h-32 rounded-xl bg-muted" />
      <div className="h-40 rounded-xl bg-muted" />
    </div>
  );
}

export default function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  return (
    <Suspense fallback={<CartFallback />}>
      <CartContent searchParams={searchParams} />
    </Suspense>
  );
}
