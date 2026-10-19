import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { isUserRole, ROLE_PATH, type UserRole } from "@/lib/auth-types";

const { auth } = NextAuth(authConfig);

const ROUTE_ROLES: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/staff/kitchen", roles: ["kitchen", "admin"] },
  { prefix: "/staff/cashier", roles: ["cashier", "admin"] },
  { prefix: "/staff/orders", roles: ["kitchen", "cashier", "admin"] },
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const rawRole = req.auth?.user?.role;
  const role = rawRole && isUserRole(rawRole) ? rawRole : null;

  if (pathname === "/login") {
    return role
      ? NextResponse.redirect(new URL(ROLE_PATH[role], req.url))
      : NextResponse.next();
  }

  if (!role) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const route = ROUTE_ROLES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (route && !route.roles.includes(role)) {
    return NextResponse.redirect(new URL(ROLE_PATH[role], req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/login"
  ],
};
