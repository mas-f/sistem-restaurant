import { Skeleton } from "@/components/ui/skeleton";

/**
 * Kerangka tampilan saat segmen halaman masih menunggu data server.
 * Dipakai oleh `loading.tsx` supaya navigasi langsung memberi umpan balik
 * (bukan layar beku) sementara beberapa round trip database selesai.
 */

function LoadingAnnouncer({ label }: { label: string }) {
  return <span className="sr-only">{label}</span>;
}

function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  );
}

function FilterBarSkeleton({ pills = 4 }: { pills?: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Skeleton className="h-9 w-full max-w-56 rounded-lg" />
      {Array.from({ length: pills }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-20 rounded-full" />
      ))}
    </div>
  );
}

function ListCardSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-11 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Halaman admin generik: judul, filter, lalu daftar. */
export function AdminPageSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-5" role="status" aria-live="polite">
      <LoadingAnnouncer label="Memuat halaman admin…" />
      <PageHeaderSkeleton />
      <FilterBarSkeleton />
      <ListCardSkeleton rows={rows} />
    </div>
  );
}

/** Daftar menu: baris dengan thumbnail gambar produk. */
export function AdminMenuSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-5" role="status" aria-live="polite">
      <LoadingAnnouncer label="Memuat daftar menu…" />
      <PageHeaderSkeleton />
      <FilterBarSkeleton pills={5} />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="size-14 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Layar staf (kitchen/cashier/orders) yang memakai lebar penuh. */
export function StaffPageSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div
      className="min-h-dvh space-y-4 bg-background px-4 py-4 lg:px-6"
      role="status"
      aria-live="polite"
    >
      <LoadingAnnouncer label="Memuat layar staf…" />
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="size-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="ml-auto h-9 w-full max-w-56 rounded-lg" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: columns }).map((_, column) => (
          <div key={column} className="space-y-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            {Array.from({ length: 3 }).map((_, card) => (
              <div
                key={card}
                className="space-y-2 rounded-xl border border-border bg-card p-3 shadow-xs"
              >
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Alur tamu (menu meja, keranjang, pelacakan pesanan). */
export function OrderPageSkeleton() {
  return (
    <div
      className="mx-auto min-h-dvh w-full max-w-5xl space-y-4 px-4 py-5"
      role="status"
      aria-live="polite"
    >
      <LoadingAnnouncer label="Memuat halaman pesanan…" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="h-9 w-full rounded-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-xs"
          >
            <Skeleton className="size-20 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
