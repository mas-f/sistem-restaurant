import { TableFormScreen } from "@/components/admin/table/table-form-screen";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function CreateTablePage() {
  // Saran area untuk datalist diambil dari meja yang sudah ada.
  const rows = await prisma.diningTable.findMany({
    select: { area: true },
    distinct: ["area"],
    orderBy: { area: "asc" },
  });

  return <TableFormScreen areaSuggestions={rows.map((row) => row.area)} />;
}
