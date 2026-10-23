import { KitchenScreen } from "@/components/kitchen/kitchen-screen";
import { getKitchenOrders } from "@/lib/orders";

export const instant = false;

export default async function KitchenPage() {
  const orders = await getKitchenOrders();
  return <KitchenScreen orders={orders} />;
}
