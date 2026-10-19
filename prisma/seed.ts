import "dotenv/config";
import argon2 from "argon2"
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const users = [
  {
    name: "Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "admin",
  },
  {
    name: "Kitchen",
    email: process.env.KITCHEN_EMAIL,
    password: process.env.KITCHEN_PASSWORD,
    role: "kitchen",
  },
  {
    name: "Kasir",
    email: process.env.CASHIER_EMAIL,
    password: process.env.CASHIER_PASSWORD,
    role: "cashier",
  },
];

const lengthPassword = 8

async function main() {
  for (const user of users) {
    if (!user.email) {
      throw new Error(`Email untuk user role "${user.role}" belum diatur di .env`);
    }

    if (!user.password || user.password.length < lengthPassword) {
      throw new Error(
        `Password untuk ${user.email} belum diatur atau kurang dari ${lengthPassword} karakter`
      );
    }

    const passwordHash = await argon2.hash(user.password, {
      type: argon2.argon2id,
    });

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        password: passwordHash,
      },
      create: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
        emailVerified: new Date()
      },
    });

    console.log(`User diproses: ${user.email}`);
  }
}

main().catch((error) => {
  console.error("Seeder gagal:", error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
