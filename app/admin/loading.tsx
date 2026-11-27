import { AdminPageSkeleton } from "@/components/page-skeleton";

/** Fallback untuk semua halaman admin yang belum punya loading khusus. */
export default function AdminLoading() {
  return <AdminPageSkeleton />;
}
