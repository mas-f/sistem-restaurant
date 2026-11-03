import { notFound } from "next/navigation";
import { SupplierFormScreen } from "@/components/admin/supplier/supplier-form-screen";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function EditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await prisma.supplier.findUnique({ where: { id } });

  if (!supplier) notFound();

  return (
    <SupplierFormScreen
      supplier={{
        id: supplier.id,
        name: supplier.name,
        contact: supplier.contact,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        isActive: supplier.isActive,
      }}
    />
  );
}
