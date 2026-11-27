import { connection } from "next/server";
import { DashboardScreen } from "@/components/admin/dashboard-screen";
import { getLowStockIngredients } from "@/lib/inventory-queries";
import { getUnavailableProducts } from "@/lib/recipe-queries";
import { getAdminDashboardData } from "@/lib/orders";

export const instant = false;

export default async function AdminDashboardPage() {
  await connection();

  // Ketiga kelompok data saling independen — jalankan bersamaan agar halaman
  // hanya menunggu satu gelombang round trip, bukan tiga berurutan.
  const [dashboard, lowStock, unavailable] = await Promise.all([
    getAdminDashboardData(),
    getLowStockIngredients(),
    getUnavailableProducts(),
  ]);

  const {
    tables,
    activeOrders,
    ordersTodayCount,
    todayRevenue,
    yesterdayRevenue,
  } = dashboard;
  const unavailableNames = unavailable.map((product) => product.name);

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
