import { notFound } from "next/navigation";
import { TableFormScreen } from "@/components/admin/table/table-form-screen";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function EditTablePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [table, areas] = await Promise.all([
    prisma.diningTable.findUnique({
      where: { id },
      select: { id: true, code: true, seats: true, area: true },
    }),
    prisma.diningTable.findMany({
      select: { area: true },
      distinct: ["area"],
      orderBy: { area: "asc" },
    }),
  ]);

  if (!table) notFound();

  return (
    <TableFormScreen
      areaSuggestions={areas.map((row) => row.area)}
      table={{
        id: table.id,
        code: table.code,
        seats: table.seats,
        area: table.area,
      }}
    />
  );
}
