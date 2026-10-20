import { TablesScreen } from "@/components/admin/table/tables-screen";
import { prisma } from "@/lib/prisma";
import type { TableStatus } from "@/lib/types";

export const instant = false;

// Enum di database ditulis huruf kecil (available, occupied, …) sementara
// StatusBadge dan seluruh UI memakai huruf kapital. Dipetakan di batas
// server → klien supaya satu-satunya tempat konvensi itu disamakan.
const DB_STATUS_TO_UI = {
  available: "AVAILABLE",
  occupied: "OCCUPIED",
  waiting_payment: "WAITING_PAYMENT",
  reserved: "RESERVED",
  cleaning: "CLEANING",
} as const satisfies Record<string, TableStatus>;

export default async function TablesPage() {
  // Dikelompokkan per area lalu kode meja, mengikuti susunan meja di lapangan.
  const rows = await prisma.diningTable.findMany({
    orderBy: [{ area: "asc" }, { code: "asc" }],
    select: {
      id: true,
      code: true,
      seats: true,
      area: true,
      status: true,
      sessionToken: true,
    },
  });

  const tables = rows.map((row) => ({
    id: row.id,
    code: row.code,
    seats: row.seats,
    area: row.area,
    status: DB_STATUS_TO_UI[row.status],
    // Nullable di database; tipe domain memakai string kosong untuk "tanpa sesi".
    sessionToken: row.sessionToken ?? "",
  }));

  return <TablesScreen tables={tables} />;
}
