import { connection } from "next/server";
import { DashboardScreen } from "@/components/admin/dashboard-screen";
import { products } from "@/lib/mock-data";
import { getLowStockIngredients } from "@/lib/inventory-queries";
import { getAdminDashboardData } from "@/lib/orders";

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();

  const { tables, activeOrders, ordersTodayCount, todayRevenue, yesterdayRevenue } =
    await getAdminDashboardData();

  // Inventaris sudah pindah ke database — peringatan stok membaca tabel
  // Ingredient, bukan data mock.
  const lowStock = await getLowStockIngredients();
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
