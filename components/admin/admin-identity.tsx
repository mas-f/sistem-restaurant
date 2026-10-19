import { auth } from "@/auth";

export async function AdminIdentity() {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email ?? "Admin";

  return <span>{name} · Admin</span>;
}
