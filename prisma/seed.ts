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

// Dicocokkan dengan mock-data (A01–A05 Indoor, B01–B03 Teras, C01–C02 VIP)
// supaya tampilan lapangan konsisten dengan referensi prototype. Status sengaja
// default "available" — status adalah state runtime, bukan data awal.
const diningTables = [
  { code: "A01", seats: 4, area: "Indoor" },
  { code: "A02", seats: 4, area: "Indoor" },
  { code: "A03", seats: 2, area: "Indoor" },
  { code: "A04", seats: 4, area: "Indoor" },
  { code: "A05", seats: 6, area: "Indoor" },
  { code: "B01", seats: 4, area: "Teras" },
  { code: "B02", seats: 2, area: "Teras" },
  { code: "B03", seats: 4, area: "Teras" },
  { code: "C01", seats: 8, area: "VIP" },
  { code: "C02", seats: 8, area: "VIP" },
];

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

  for (const table of diningTables) {
    // Ensure-only: meja yang sudah ada tidak disentuh sama sekali — data
    // buatan user (kursi, area) maupun sessionToken QR yang sudah tercetak
    // harus tetap apa adanya saat seed dijalankan ulang.
    const existing = await prisma.diningTable.findUnique({
      where: { code: table.code },
      select: { id: true },
    });
    if (existing) {
      console.log(`Meja sudah ada: ${table.code}`);
      continue;
    }

    await prisma.diningTable.create({
      data: { ...table, sessionToken: crypto.randomUUID() },
    });
    console.log(`Meja dibuat: ${table.code}`);
  }
}

main().catch((error) => {
  console.error("Seeder gagal:", error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
