import { PaymentsScreen } from "@/components/admin/payments-screen";
import { getPaymentsForScreen } from "@/lib/orders";

export const instant = false;

export default async function Page() {
  const payments = await getPaymentsForScreen();
  return <PaymentsScreen payments={payments} />;
}
