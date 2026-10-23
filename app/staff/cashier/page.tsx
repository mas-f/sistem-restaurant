import { auth } from "@/auth";
import { CashierScreen } from "@/components/cashier/cashier-screen";
import { getCashierData } from "@/lib/orders";

export const instant = false;

export default async function CashierPage() {
  const [data, session] = await Promise.all([getCashierData(), auth()]);

  return (
    <CashierScreen
      tables={data.tables}
      sessions={data.sessions}
      orders={data.orders}
      cashierName={session?.user?.name ?? null}
    />
  );
}
