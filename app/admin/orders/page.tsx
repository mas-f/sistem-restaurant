import { AdminOrdersScreen } from "@/components/admin/admin-orders-screen";
import { ORDER_QUERY_MAX, parseOrderStatusFilter } from "@/lib/order-filters";
import { getOrdersPage } from "@/lib/orders";

export const instant = false;

interface OrdersSearchParams {
  q?: string;
  status?: string;
  page?: string;
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<OrdersSearchParams>;
}) {
  const sp = await searchParams;

  const q =
    typeof sp.q === "string" ? sp.q.trim().slice(0, ORDER_QUERY_MAX) : "";
  const status = parseOrderStatusFilter(sp.status);
  const rawPage = Number.parseInt(
    typeof sp.page === "string" ? sp.page : "",
    10
  );

  const result = await getOrdersPage({
    q,
    status,
    page: Number.isFinite(rawPage) ? rawPage : 1,
  });

  return <AdminOrdersScreen {...result} q={q} status={status} />;
}
