import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MenuScreen } from "@/components/customer/menu-screen";
import { resolveTableByToken } from "@/lib/resolve-table";

// Dinamis penuh (tanpa shell PPR): connection() + resolve token di level page,
// bukan di dalam Suspense — supaya notFound() untuk QR basi mengirim status
// 404 sungguhan, bukan shell 200 yang berisi konten 404.
export const instant = false;

export default async function TableOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  await connection();
  const { token } = await params;
  // Token QR dari database; fallback mock menjaga tautan lama tetap terbuka.
  const table = await resolveTableByToken(token);

  if (!table) notFound();

  return (
    <MenuScreen
      tableCode={table.code}
      tableToken={table.sessionToken || table.code}
      guestLabel="Pesan langsung dari meja kamu — tanpa antre"
    />
  );
}
