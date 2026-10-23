import { OrdersScreen } from "@/components/admin/orders-screen";
import { getOrdersForScreen } from "@/lib/orders";

export const instant = false;

export default async function Page() {
  const orders = await getOrdersForScreen();
  return <OrdersScreen orders={orders} />;
}
