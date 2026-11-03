import {
  InventoryScreen,
  type InventoryKpis,
  type InventoryRow,
  type InventoryStatusFilter,
} from "@/components/admin/inventory/inventory-screen";
import { prisma } from "@/lib/prisma";
import {
  ingredientValue,
  inventoryStatus,
  type InventoryStatus,
} from "@/lib/inventory";

export const instant = false;

const PAGE_SIZE = 20;
const MAX_QUERY_LENGTH = 80;

const STATUS_FILTERS: InventoryStatusFilter[] = [
  "",
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "INACTIVE",
];

interface InventorySearchParams {
  q?: string;
  status?: string;
  supplier?: string;
  page?: string;
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<InventorySearchParams>;
}) {
  const sp = await searchParams;

  const q =
    typeof sp.q === "string" ? sp.q.trim().slice(0, MAX_QUERY_LENGTH) : "";

  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // Supplier asing dari URL diabaikan supaya filter tidak pernah menghasilkan
  // kombinasi yang mustahil.
  const rawSupplier =
    typeof sp.supplier === "string" ? sp.supplier.trim() : "";
  const supplier = suppliers.some((row) => row.id === rawSupplier)
    ? rawSupplier
    : "";

  const rawStatus = typeof sp.status === "string" ? sp.status.trim() : "";
  const status = STATUS_FILTERS.includes(rawStatus as InventoryStatusFilter)
    ? (rawStatus as InventoryStatusFilter)
    : "";

  const rowsRaw = await prisma.ingredient.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      ...(supplier ? { supplierId: supplier } : {}),
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      unit: true,
      stock: true,
      minStock: true,
      costPerUnit: true,
      isActive: true,
      supplier: { select: { name: true } },
      _count: { select: { movements: true } },
    },
  });

  const rows: InventoryRow[] = rowsRaw.map((row) => {
    const stock = Number(row.stock);
    const minStock = Number(row.minStock);

    return {
      id: row.id,
      name: row.name,
      unit: row.unit,
      stock,
      minStock,
      costPerUnit: row.costPerUnit,
      value: ingredientValue(stock, row.costPerUnit),
      supplierName: row.supplier?.name ?? null,
      status: inventoryStatus(stock, minStock),
      isActive: row.isActive,
      movementCount: row._count.movements,
    };
  });

  // KPI selalu menggambarkan seluruh bahan aktif, bukan hasil filter halaman.
  const activeRows = rows.filter((row) => row.isActive);
  const kpis: InventoryKpis = {
    total: activeRows.length,
    low: activeRows.filter((row) => row.status === "LOW_STOCK").length,
    out: activeRows.filter((row) => row.status === "OUT_OF_STOCK").length,
    value: activeRows.reduce((sum, row) => sum + row.value, 0),
  };

  const filtered =
    status === "INACTIVE"
      ? rows.filter((row) => !row.isActive)
      : status
        ? activeRows.filter(
          (row) => row.status === (status as InventoryStatus)
        )
        : activeRows;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const rawPage = Number.parseInt(sp.page ?? "", 10);
  const page = Number.isFinite(rawPage)
    ? Math.min(Math.max(1, rawPage), totalPages)
    : 1;

  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const showingFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(page * PAGE_SIZE, total);

  return (
    <InventoryScreen
      rows={pageRows}
      suppliers={suppliers}
      kpis={kpis}
      q={q}
      status={status}
      supplier={supplier}
      page={page}
      totalPages={totalPages}
      total={total}
      showingFrom={showingFrom}
      showingTo={showingTo}
    />
  );
}
