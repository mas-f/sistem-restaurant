import { connection } from "next/server";
import { DashboardScreen } from "@/components/admin/dashboard-screen";
import { ingredients, products } from "@/lib/mock-data";
import { getAdminDashboardData } from "@/lib/orders";

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();

  const { tables, activeOrders, ordersTodayCount, todayRevenue, yesterdayRevenue } =
    await getAdminDashboardData();

  // Inventaris belum punya tabel database — pertahankan data mock sampai
  // layar inventaris dimigrasikan.
  const lowStock = ingredients
    .filter((item) => item.stock < item.minStock)
    .map(({ id, name, unit, stock, minStock }) => ({
      id,
      name,
      unit,
      stock,
      minStock,
    }));
  const unavailableNames = products
    .filter((product) => !product.available)
    .map((product) => product.name);

  return (
    <DashboardScreen
      tables={tables}
      activeOrders={activeOrders}
      ordersTodayCount={ordersTodayCount}
      todayRevenue={todayRevenue}
      yesterdayRevenue={yesterdayRevenue}
      lowStock={lowStock}
      unavailableNames={unavailableNames}
    />
  );
}
