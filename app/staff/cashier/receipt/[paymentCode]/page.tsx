import { notFound } from "next/navigation";
import { ReceiptScreen } from "@/components/cashier/receipt-screen";
import { getReceiptByCode } from "@/lib/orders";

export const instant = false;

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ paymentCode: string }>;
}) {
  const { paymentCode } = await params;
  const receipt = await getReceiptByCode(decodeURIComponent(paymentCode));

  if (!receipt) notFound();

  return <ReceiptScreen receipt={receipt} />;
}
