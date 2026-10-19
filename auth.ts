import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { USER_ROLES } from "@/lib/auth-types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const parsed = z.object({
          email: z.email(),
          password: z.string().min(1),
        }).safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await argon2.verify(user.password, password);

        if (!isValid) return null;

        const role = z.enum(USER_ROLES).safeParse(user.role);

        if (!role.success) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: role.data,
        };
      },
    }),
  ],
});
