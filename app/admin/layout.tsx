import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminIdentity } from "@/components/admin/admin-identity";

export const metadata: Metadata = {
  title: "Admin — RestoFlow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell
      identity={
        <Suspense fallback={<span>Admin</span>}>
          <AdminIdentity />
        </Suspense>
      }
    >
      {children}
    </AdminShell>
  );
}
