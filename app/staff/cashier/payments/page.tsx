import { CashierPaymentsScreen } from "@/components/cashier/payments-screen";
import { getPaymentsForScreen } from "@/lib/orders";

export const instant = false;

export default async function CashierPaymentsPage() {
  const payments = await getPaymentsForScreen();
  return <CashierPaymentsScreen payments={payments} />;
}
