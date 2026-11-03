import "dotenv/config";
import { getOrdersPage } from "@/lib/orders";

type Result = Awaited<ReturnType<typeof getOrdersPage>>;

function summarize(label: string, result: Result) {
  console.log(
    `${label}: page=${result.page}/${result.totalPages} total=${result.total} ` +
      `showing=${result.showingFrom}-${result.showingTo} rows=${result.orders.length}`
  );
  console.log(`  codes: ${result.orders.map((order) => order.code).join(", ")}`);
}

async function main() {
  const all = await getOrdersPage({ page: 1 });
  summarize("semua hal.1", all);

  const second = await getOrdersPage({ page: 2 });
  summarize("semua hal.2", second);

  const overlap = second.orders.filter((order) =>
    all.orders.some((first) => first.id === order.id)
  );
  console.log(`  irisan hal.1 vs hal.2: ${overlap.length} (harus 0)`);

  const clamped = await getOrdersPage({ page: 999 });
  summarize("page=999 (clamp)", clamped);

  const cancelled = await getOrdersPage({ status: "CANCELLED" });
  summarize("status=CANCELLED", cancelled);

  const preparing = await getOrdersPage({ status: "PREPARING" });
  summarize("status=PREPARING", preparing);
  console.log(
    `  semua status PREPARING? ${preparing.orders.every(
      (order) => order.status === "PREPARING"
    )}`
  );

  const search = await getOrdersPage({ q: "a0" });
  summarize("q=a0 (kode meja)", search);
  console.log(
    `  semua cocok? ${search.orders.every((order) =>
      `${order.code} ${order.tableCode}`.toLowerCase().includes("a0")
    )}`
  );

  const combined = await getOrdersPage({
    q: "ORD",
    status: "COMPLETED",
    page: 1,
  });
  summarize("q=ORD + COMPLETED", combined);
  console.log(
    `  semua COMPLETED & cocok? ${combined.orders.every(
      (order) =>
        order.status === "COMPLETED" &&
        `${order.code} ${order.tableCode}`.toLowerCase().includes("ord")
    )}`
  );

  process.exit(0);
}

void main();
