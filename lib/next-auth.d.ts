import "next-auth";
import "next-auth/jwt";
import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/auth-types";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
