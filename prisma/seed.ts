import "dotenv/config";
import argon2 from "argon2"
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { stationForCategory } from "../lib/menu";
import { toDbStation } from "../lib/order-utils";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const users = [
  {
    name: "Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "admin",
  },
  {
    name: "Kitchen",
    email: process.env.KITCHEN_EMAIL,
    password: process.env.KITCHEN_PASSWORD,
    role: "kitchen",
  },
  {
    name: "Kasir",
    email: process.env.CASHIER_EMAIL,
    password: process.env.CASHIER_PASSWORD,
    role: "cashier",
  },
];

const lengthPassword = 8

// Dicocokkan dengan mock-data (A01–A05 Indoor, B01–B03 Teras, C01–C02 VIP)
// supaya tampilan lapangan konsisten dengan referensi prototype. Status sengaja
// default "available" — status adalah state runtime, bukan data awal.
const diningTables = [
  { code: "A01", seats: 4, area: "Indoor" },
  { code: "A02", seats: 4, area: "Indoor" },
  { code: "A03", seats: 2, area: "Indoor" },
  { code: "A04", seats: 4, area: "Indoor" },
  { code: "A05", seats: 6, area: "Indoor" },
  { code: "B01", seats: 4, area: "Teras" },
  { code: "B02", seats: 2, area: "Teras" },
  { code: "B03", seats: 4, area: "Teras" },
  { code: "C01", seats: 8, area: "VIP" },
  { code: "C02", seats: 8, area: "VIP" },
];

type DemoItem = { productIndex: number; quantity: number; note?: string };

// Skenario demo lintas layar: satu meja baru, satu sedang dimasak, satu siap
// disajikan. Seed ini hanya dipakai saat database belum punya sesi sama sekali.
const demoOpenSessions: {
  tableCode: string;
  orders: {
    status: "pending" | "confirmed" | "preparing" | "ready";
    kitchenStatus: "new" | "accepted" | "preparing" | "ready";
    minsAgo: number;
    items: DemoItem[];
  }[];
}[] = [
  {
    tableCode: "A01",
    orders: [
      {
        status: "preparing",
        kitchenStatus: "preparing",
        minsAgo: 14,
        items: [
          { productIndex: 1, quantity: 2, note: "Pedas sedang" },
          { productIndex: 2, quantity: 1 },
        ],
      },
      {
        status: "pending",
        kitchenStatus: "new",
        minsAgo: 4,
        items: [{ productIndex: 0, quantity: 1, note: "Tanpa es" }],
      },
    ],
  },
  {
    tableCode: "A03",
    orders: [
      {
        status: "ready",
        kitchenStatus: "ready",
        minsAgo: 18,
        items: [
          { productIndex: 4, quantity: 2 },
          { productIndex: 0, quantity: 1 },
        ],
      },
    ],
  },
  {
    tableCode: "B01",
    orders: [
      {
        status: "confirmed",
        kitchenStatus: "accepted",
        minsAgo: 7,
        items: [
          { productIndex: 3, quantity: 1 },
          { productIndex: 2, quantity: 2 },
        ],
      },
    ],
  },
  {
    tableCode: "C02",
    orders: [
      {
        status: "preparing",
        kitchenStatus: "preparing",
        minsAgo: 9,
        items: [{ productIndex: 1, quantity: 1 }],
      },
    ],
  },
];

const demoClosedSessions: {
  tableCode: string;
  method: "qris" | "cash";
  minsAgo: number;
  items: DemoItem[];
}[] = [
  {
    tableCode: "A02",
    method: "qris",
    minsAgo: 95,
    items: [
      { productIndex: 1, quantity: 1 },
      { productIndex: 2, quantity: 2 },
    ],
  },
  {
    tableCode: "A04",
    method: "cash",
    minsAgo: 180,
    items: [
      { productIndex: 4, quantity: 2 },
      { productIndex: 0, quantity: 1 },
    ],
  },
];

type DemoProduct = {
  id: string;
  name: string;
  price: number;
  category: { name: string; slug: string };
};

function buildDemoItems(specs: DemoItem[], products: DemoProduct[]) {
  return specs.map((spec) => {
    const product = products[spec.productIndex % products.length];
    return {
      productId: product.id,
      productName: product.name,
      quantity: spec.quantity,
      unitPrice: product.price,
      station: toDbStation(stationForCategory(product.category)),
      note: spec.note ?? "",
    };
  });
}

function demoTotals(items: ReturnType<typeof buildDemoItems>) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return { subtotal, total: subtotal };
}

async function main() {
  for (const user of users) {
    if (!user.email) {
      throw new Error(`Email untuk user role "${user.role}" belum diatur di .env`);
    }

    if (!user.password || user.password.length < lengthPassword) {
      throw new Error(
        `Password untuk ${user.email} belum diatur atau kurang dari ${lengthPassword} karakter`
      );
    }

    const passwordHash = await argon2.hash(user.password, {
      type: argon2.argon2id,
    });

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        password: passwordHash,
      },
      create: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
        emailVerified: new Date()
      },
    });

    console.log(`User diproses: ${user.email}`);
  }

  for (const table of diningTables) {
    // Ensure-only: meja yang sudah ada tidak disentuh sama sekali — data
    // buatan user (kursi, area) maupun sessionToken QR yang sudah tercetak
    // harus tetap apa adanya saat seed dijalankan ulang.
    const existing = await prisma.diningTable.findUnique({
      where: { code: table.code },
      select: { id: true },
    });
    if (existing) {
      console.log(`Meja sudah ada: ${table.code}`);
      continue;
    }

    await prisma.diningTable.create({
      data: { ...table, sessionToken: crypto.randomUUID() },
    });
    console.log(`Meja dibuat: ${table.code}`);
  }

  await seedDemoOrders();
}

async function seedDemoOrders() {
  const existingSessions = await prisma.tableSession.count();
  if (existingSessions > 0) {
    console.log("Demo order dilewati: sudah ada sesi di database.");
    return;
  }

  const products = await prisma.product.findMany({
    take: 5,
    include: { category: { select: { name: true, slug: true } } },
  });

  if (products.length === 0) {
    console.log("Demo order dilewati: belum ada produk.");
    return;
  }

  const tableCodes = [
    ...demoOpenSessions.map((session) => session.tableCode),
    ...demoClosedSessions.map((session) => session.tableCode),
  ];

  const tables = await prisma.diningTable.findMany({
    where: { code: { in: tableCodes } },
    select: { id: true, code: true, seats: true },
  });
  const tableByCode = new Map(tables.map((table) => [table.code, table]));

  const cashier = await prisma.user.findFirst({
    where: { role: "cashier" },
    select: { id: true },
  });

  let orderSeq = 1;
  let paymentSeq = 1;

  for (const spec of demoOpenSessions) {
    const table = tableByCode.get(spec.tableCode);
    if (!table) {
      console.log(`Demo sesi dilewati: meja ${spec.tableCode} tidak ada.`);
      continue;
    }

    const latestMinsAgo = Math.max(
      ...spec.orders.map((order) => order.minsAgo),
      0
    );
    const openedAt = new Date(
      Date.now() - (latestMinsAgo + 5) * 60_000
    );

    await prisma.tableSession.create({
      data: {
        tableId: table.id,
        guests: Math.min(table.seats, 4),
        status: "open",
        openedAt,
        orders: {
          create: spec.orders.map((orderSpec) => {
            const items = buildDemoItems(orderSpec.items, products);
            const totals = demoTotals(items);

            return {
              code: `ORD-DEMO-${String(orderSeq++).padStart(3, "0")}`,
              tableCode: table.code,
              status: orderSpec.status,
              kitchenStatus: orderSpec.kitchenStatus,
              ...totals,
              note: "",
              createdAt: new Date(Date.now() - orderSpec.minsAgo * 60_000),
              items: { create: items },
            };
          }),
        },
      },
    });

    await prisma.diningTable.update({
      where: { id: table.id },
      data: { status: "occupied" },
    });

    console.log(`Demo sesi dibuat: ${table.code}`);
  }

  for (const spec of demoClosedSessions) {
    const table = tableByCode.get(spec.tableCode);
    if (!table) {
      console.log(`Demo pembayaran dilewati: meja ${spec.tableCode} tidak ada.`);
      continue;
    }

    const items = buildDemoItems(spec.items, products);
    const totals = demoTotals(items);
    const closedAt = new Date(Date.now() - spec.minsAgo * 60_000);
    const openedAt = new Date(closedAt.getTime() - 45 * 60_000);
    const amountReceived =
      spec.method === "cash"
        ? Math.ceil(totals.total / 50_000) * 50_000
        : null;

    await prisma.$transaction(async (tx) => {
      const session = await tx.tableSession.create({
        data: {
          tableId: table.id,
          guests: Math.min(table.seats, 4),
          status: "closed",
          billStatus: "paid",
          openedAt,
          closedAt,
        },
      });

      const order = await tx.order.create({
        data: {
          code: `ORD-DEMO-${String(orderSeq++).padStart(3, "0")}`,
          sessionId: session.id,
          tableCode: table.code,
          status: "completed",
          kitchenStatus: "ready",
          ...totals,
          note: "",
          createdAt: openedAt,
          items: { create: items },
        },
        select: { id: true },
      });

      const payment = await tx.payment.create({
        data: {
          code: `PAY-DEMO-${String(paymentSeq++).padStart(3, "0")}`,
          sessionId: session.id,
          amount: totals.total,
          method: spec.method,
          status: "paid",
          amountReceived,
          change:
            amountReceived !== null
              ? amountReceived - totals.total
              : null,
          cashierId: cashier?.id ?? null,
          paidAt: closedAt,
        },
        select: { id: true },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { paymentId: payment.id },
      });
    });

    console.log(`Demo pembayaran dibuat: ${table.code}`);
  }
}

main().catch((error) => {
  console.error("Seeder gagal:", error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
