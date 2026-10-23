import { connection } from "next/server";
import { SalesScreen } from "@/components/admin/sales-screen";
import { getSalesData } from "@/lib/orders";

export const instant = false;

export default async function Page() {
  await connection();

  const { orders, payments } = await getSalesData();
  return <SalesScreen orders={orders} payments={payments} />;
}
