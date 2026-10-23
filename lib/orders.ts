import { prisma } from "@/lib/prisma";
import type {
  BillStatus,
  DiningTable,
  KitchenStatus,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentView,
  ReceiptView,
  TableSession,
  TableStatus,
} from "@/lib/types";

// Enum database lowercase → tipe UI uppercase (PRD §26).
type DbTableStatus = "available" | "occupied" | "waiting_payment" | "reserved" | "cleaning";
type DbBillStatus = "not_requested" | "requested" | "processing" | "paid";
type DbOrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";
type DbKitchenStatus = "new" | "accepted" | "preparing" | "ready";
type DbPaymentMethod = "cash" | "qris";
type DbPaymentStatus = "pending" | "paid" | "failed" | "refunded";
type DbStation = "grill" | "wok" | "bar";

const TABLE_STATUS_TO_UI: Record<DbTableStatus, TableStatus> = {
  available: "AVAILABLE",
  occupied: "OCCUPIED",
  waiting_payment: "WAITING_PAYMENT",
  reserved: "RESERVED",
  cleaning: "CLEANING",
};

const BILL_STATUS_TO_UI: Record<DbBillStatus, BillStatus> = {
  not_requested: "NOT_REQUESTED",
  requested: "REQUESTED",
  processing: "PROCESSING",
  paid: "PAID",
};

const ORDER_STATUS_TO_UI: Record<DbOrderStatus, OrderStatus> = {
  pending: "PENDING",
  confirmed: "CONFIRMED",
  preparing: "PREPARING",
  ready: "READY",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

const KITCHEN_STATUS_TO_UI: Record<DbKitchenStatus, KitchenStatus> = {
  new: "NEW",
  accepted: "ACCEPTED",
  preparing: "PREPARING",
  ready: "READY",
};

const PAYMENT_METHOD_TO_UI: Record<DbPaymentMethod, PaymentMethod> = {
  cash: "CASH",
  qris: "QRIS",
};

const PAYMENT_STATUS_TO_UI: Record<DbPaymentStatus, PaymentStatus> = {
  pending: "PENDING",
  paid: "PAID",
  failed: "FAILED",
  refunded: "REFUNDED",
};

const STATION_TO_UI: Record<DbStation, string> = {
  grill: "Grill",
  wok: "Wok",
  bar: "Bar",
};

export type OrderRow = {
  id: string;
  code: string;
  sessionId: string;
  tableCode: string;
  status: DbOrderStatus;
  kitchenStatus: DbKitchenStatus;
  subtotal: number;
  total: number;
  note: string;
  createdAt: Date;
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    quantity: number;
    unitPrice: number;
    station: DbStation;
    note: string;
  }>;
  session?: {
    id: string;
    table: { sessionToken: string };
  } | null;
};

export type TableSessionRow = {
  id: string;
  tableId: string;
  guests: number;
  billStatus: DbBillStatus;
  openedAt: Date;
  orders?: Array<{ id: string }>;
};

export type DiningTableRow = {
  id: string;
  code: string;
  seats: number;
  area: string;
  status: DbTableStatus;
  sessionToken: string;
};

export type PaymentRow = {
  id: string;
  code: string;
  sessionId: string;
  amount: number;
  method: DbPaymentMethod;
  status: DbPaymentStatus;
  paidAt: Date;
  cashier: { name: string | null } | null;
  session: {
    table: { code: string };
  };
  orders: Array<{ code: string }>;
};

export function toUiOrder(row: OrderRow): Order {
  return {
    id: row.id,
    code: row.code,
    sessionId: row.sessionId,
    sessionToken: row.session?.table.sessionToken ?? "",
    tableCode: row.tableCode,
    items: row.items.map((item) => ({
      id: item.id,
      productId: item.productId ?? "",
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      modifierNames: [],
      modifierDelta: 0,
      note: item.note,
      station: STATION_TO_UI[item.station],
    })),
    createdAt: row.createdAt.toISOString(),
    status: ORDER_STATUS_TO_UI[row.status],
    kitchenStatus: KITCHEN_STATUS_TO_UI[row.kitchenStatus],
    note: row.note,
    subtotal: row.subtotal,
    total: row.total,
  };
}

export function toUiTableSession(row: TableSessionRow): TableSession {
  return {
    id: row.id,
    tableId: row.tableId,
    guests: row.guests,
    startedAt: row.openedAt.toISOString(),
    billStatus: BILL_STATUS_TO_UI[row.billStatus],
    orderIds: row.orders?.map((order) => order.id) ?? [],
  };
}

export function toUiDiningTable(row: DiningTableRow): DiningTable {
  return {
    id: row.id,
    code: row.code,
    seats: row.seats,
    area: row.area,
    status: TABLE_STATUS_TO_UI[row.status],
    sessionToken: row.sessionToken,
  };
}

export function toUiPayment(row: PaymentRow): PaymentView {
  return {
    id: row.id,
    code: row.code,
    sessionId: row.sessionId,
    tableCode: row.session.table.code,
    orderCodes: row.orders.map((order) => order.code),
    amount: row.amount,
    method: PAYMENT_METHOD_TO_UI[row.method],
    status: PAYMENT_STATUS_TO_UI[row.status],
    paidAt: row.paidAt.toISOString(),
    cashierName: row.cashier?.name ?? null,
  };
}

/** Order untuk halaman admin/staff, terbaru dulu. */
export async function getOrdersForScreen(take = 200): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      items: { orderBy: { id: "asc" } },
      session: { include: { table: { select: { sessionToken: true } } } },
    },
  });

  return rows.map(toUiOrder);
}

/** Order aktif untuk Kitchen Display, terlama dulu agar antrean terlihat. */
export async function getKitchenOrders(): Promise<Order[]> {
  const rows = await prisma.order.findMany({
    where: { status: { notIn: ["completed", "cancelled"] } },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: {
      items: { orderBy: { id: "asc" } },
      session: { include: { table: { select: { sessionToken: true } } } },
    },
  });

  return rows.map(toUiOrder);
}

/** Data meja, sesi terbuka, dan order aktif untuk layar kasir. */
export async function getCashierData(): Promise<{
  tables: DiningTable[];
  sessions: TableSession[];
  orders: Order[];
}> {
  const [tables, sessions] = await Promise.all([
    prisma.diningTable.findMany({
      orderBy: { code: "asc" },
      select: {
        id: true,
        code: true,
        seats: true,
        area: true,
        status: true,
        sessionToken: true,
      },
    }),
    prisma.tableSession.findMany({
      where: { status: "open" },
      orderBy: { openedAt: "asc" },
      include: {
        table: { select: { sessionToken: true } },
        orders: {
          where: { status: { not: "cancelled" }, paymentId: null },
          orderBy: { createdAt: "asc" },
          include: {
            items: { orderBy: { id: "asc" } },
            session: { include: { table: { select: { sessionToken: true } } } },
          },
        },
      },
    }),
  ]);

  return {
    tables: tables.map(toUiDiningTable),
    sessions: sessions.map(toUiTableSession),
    orders: sessions.flatMap((session) => session.orders.map(toUiOrder)),
  };
}

/** Riwayat pembayaran untuk halaman admin dan kasir. */
export async function getPaymentsForScreen(take = 200): Promise<PaymentView[]> {
  const rows = await prisma.payment.findMany({
    orderBy: { paidAt: "desc" },
    take,
    include: {
      cashier: { select: { name: true } },
      session: { include: { table: { select: { code: true } } } },
      orders: { select: { code: true }, orderBy: { createdAt: "asc" } },
    },
  });

  return rows.map(toUiPayment);
}

/** Kwitansi untuk satu pembayaran, termasuk hanya order yang dibayar di transaksi itu. */
export async function getReceiptByCode(
  code: string
): Promise<ReceiptView | null> {
  const row = await prisma.payment.findUnique({
    where: { code },
    include: {
      cashier: { select: { name: true } },
      session: { include: { table: { select: { code: true } } } },
      orders: {
        orderBy: { createdAt: "asc" },
        include: { items: { orderBy: { id: "asc" } } },
      },
    },
  });

  if (!row) return null;

  return {
    paymentCode: row.code,
    paidAt: row.paidAt.toISOString(),
    tableCode: row.session.table.code,
    cashierName: row.cashier?.name ?? null,
    method: PAYMENT_METHOD_TO_UI[row.method],
    amount: row.amount,
    amountReceived: row.amountReceived,
    change: row.change,
    orders: row.orders.map((order) => ({
      code: order.code,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        note: item.note,
      })),
    })),
  };
}

/** Awal hari menurut zona waktu server — dipakai filter "hari ini". */
function startOfLocalDay(daysAgo = 0): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

export type AdminDashboardData = {
  tables: DiningTable[];
  activeOrders: Order[];
  ordersTodayCount: number;
  todayRevenue: number;
  yesterdayRevenue: number;
};

/** KPI dashboard admin: meja, order aktif, dan pendapatan hari ini. */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const todayStart = startOfLocalDay();
  const yesterdayStart = startOfLocalDay(1);

  const [tables, activeOrders, ordersTodayCount, todayPayments, yesterdayPayments] =
    await Promise.all([
      prisma.diningTable.findMany({
        orderBy: { code: "asc" },
        select: {
          id: true,
          code: true,
          seats: true,
          area: true,
          status: true,
          sessionToken: true,
        },
      }),
      prisma.order.findMany({
        where: { status: { notIn: ["completed", "cancelled"] } },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          items: { orderBy: { id: "asc" } },
          session: { include: { table: { select: { sessionToken: true } } } },
        },
      }),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.payment.aggregate({
        where: { status: "paid", paidAt: { gte: todayStart } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: "paid",
          paidAt: { gte: yesterdayStart, lt: todayStart },
        },
        _sum: { amount: true },
      }),
    ]);

  return {
    tables: tables.map(toUiDiningTable),
    activeOrders: activeOrders.map(toUiOrder),
    ordersTodayCount,
    todayRevenue: todayPayments._sum.amount ?? 0,
    yesterdayRevenue: yesterdayPayments._sum.amount ?? 0,
  };
}

export type SalesData = {
  orders: Order[];
  payments: PaymentView[];
};

/** Penjualan hari ini untuk halaman Sales Dashboard. */
export async function getSalesData(): Promise<SalesData> {
  const todayStart = startOfLocalDay();

  const [orders, payments] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: todayStart },
        status: { not: "cancelled" },
      },
      orderBy: { createdAt: "asc" },
      include: {
        items: { orderBy: { id: "asc" } },
        session: { include: { table: { select: { sessionToken: true } } } },
      },
    }),
    prisma.payment.findMany({
      where: { status: "paid", paidAt: { gte: todayStart } },
      orderBy: { paidAt: "asc" },
      include: {
        cashier: { select: { name: true } },
        session: { include: { table: { select: { code: true } } } },
        orders: { select: { code: true }, orderBy: { createdAt: "asc" } },
      },
    }),
  ]);

  return {
    orders: orders.map(toUiOrder),
    payments: payments.map(toUiPayment),
  };
}
