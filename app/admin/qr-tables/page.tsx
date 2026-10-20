import { QrTablesScreen, type QrTable } from "@/components/admin/qr-table/qr-screen";
import { qrSvg, tableQrUrl } from "@/lib/qrcode";
import { prisma } from "@/lib/prisma";

export const instant = false;

// Halaman QR bersifat server-side: URL diambil dari NEXT_PUBLIC_APP_URL dan
// SVG dibangkitkan dengan qrcode — bukan pola dekoratif seperti prototype.
export default async function QrTablesPage() {
  const rows = await prisma.diningTable.findMany({
    orderBy: [{ area: "asc" }, { code: "asc" }],
    select: { id: true, code: true, area: true, sessionToken: true },
  });

  const tables = await Promise.all(
    rows.map(async (row): Promise<QrTable> => {
      const url = tableQrUrl(row.sessionToken);
      return { id: row.id, code: row.code, area: row.area, url, svg: await qrSvg(url) };
    })
  );

  return <QrTablesScreen tables={tables} />;
}
