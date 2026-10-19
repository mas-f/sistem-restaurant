import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MenuScreen } from "@/components/customer/menu-screen";
import { tables } from "@/lib/mock-data";

async function TableContent({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const decoded = decodeURIComponent(token);
  const table =
    tables.find((t) => t.sessionToken === decoded) ??
    tables.find((t) => t.code.toLowerCase() === decoded.toLowerCase()) ??
    tables[0];

  if (!table) notFound();

  return (
    <MenuScreen
      tableCode={table.code}
      tableToken={table.sessionToken || table.code}
      guestLabel="Pesan langsung dari meja kamu — tanpa antre"
    />
  );
}

function MenuFallback() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl animate-pulse space-y-4 px-4 py-6">
      <div className="h-12 rounded-xl bg-muted" />
      <div className="h-10 rounded-full bg-muted" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

export default function TableOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense fallback={<MenuFallback />}>
      <TableContent params={params} />
    </Suspense>
  );
}
