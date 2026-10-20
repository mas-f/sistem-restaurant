import { prisma } from "@/lib/prisma";
import { tables as mockTables } from "@/lib/mock-data";
import type { DiningTable, TableStatus } from "@/lib/types";

// Enum di database ditulis huruf kecil (available, occupied, …) sementara
// StatusBadge dan seluruh UI memakai huruf kapital (PRD §26).
const DB_STATUS_TO_UI = {
  available: "AVAILABLE",
  occupied: "OCCUPIED",
  waiting_payment: "WAITING_PAYMENT",
  reserved: "RESERVED",
  cleaning: "CLEANING",
} as const satisfies Record<string, TableStatus>;

type TableRow = {
  id: string;
  code: string;
  seats: number;
  area: string;
  status: keyof typeof DB_STATUS_TO_UI;
  sessionToken: string;
};

const TABLE_SELECT = {
  id: true,
  code: true,
  seats: true,
  area: true,
  status: true,
  sessionToken: true,
} as const;

function toDomain(row: TableRow): DiningTable {
  return {
    id: row.id,
    code: row.code,
    seats: row.seats,
    area: row.area,
    status: DB_STATUS_TO_UI[row.status],
    sessionToken: row.sessionToken,
  };
}

function safeDecode(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    // Percent-encoding rusak (mis. "%zz") — pakai literal apa adanya.
    return raw;
  }
}

/**
 * Resolusi identitas meja dari token QR / tautan.
 *
 * Urutan: token DB → kode DB (case-insensitive) → token mock → kode mock.
 * Fallback mock dipertahankan selama alur customer masih memakai data mock
 * (mis. tautan lama sess_a01_9842). Mengembalikan null bila tidak ada yang
 * cocok — pemanggil yang memutuskan notFound atau fallback demo.
 */
export async function resolveTableByToken(
  raw: string | null | undefined
): Promise<DiningTable | null> {
  const token = raw ? safeDecode(raw).trim() : "";
  if (!token) return null;

  const byToken = await prisma.diningTable.findUnique({
    where: { sessionToken: token },
    select: TABLE_SELECT,
  });
  if (byToken) return toDomain(byToken);

  const byCode = await prisma.diningTable.findFirst({
    where: { code: { equals: token, mode: "insensitive" } },
    select: TABLE_SELECT,
    orderBy: { code: "asc" },
  });
  if (byCode) return toDomain(byCode);

  const mock =
    mockTables.find((t) => t.sessionToken === token) ??
    mockTables.find((t) => t.code.toLowerCase() === token.toLowerCase());
  return mock ?? null;
}

/**
 * Fallback demo untuk tautan tanpa token (mis. buka /order/cart langsung):
 * meja mock pertama yang punya sesi, persis perilaku lama halaman cart.
 */
export function fallbackMockTable(): DiningTable {
  return mockTables.find((t) => t.sessionToken) ?? mockTables[0];
}
