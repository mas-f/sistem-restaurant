import "dotenv/config";
import argon2 from "argon2"
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { stationForCategory } from "../lib/menu";
import { toDbStation } from "../lib/order-utils";

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

// Mode "resep saja": hanya menyiapkan bahan + resep, tanpa menyentuh user,
// meja, maupun demo session/order. Dipakai untuk melengkapi database yang
// produknya sudah dibuat lewat admin.
const recipesOnly = process.argv.includes("--recipes-only");

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

// Data awal inventaris. Stok hanya dipakai saat bahan pertama kali dibuat —
// seed berikutnya tidak boleh menimpa stok yang sudah diubah lewat mutasi.
const suppliers = [
  { name: "Segar Tani Sayur", contact: "Pak Handoko", phone: "0812-1111-2222" },
  { name: "Mitra Daging Nusantara", contact: "Ibu Ratna", phone: "0813-3333-4444" },
  { name: "Seafood Bahari Jaya", contact: "Pak Yudi", phone: "0821-5555-6666" },
  { name: "Bumbu Dapur Prima", contact: "Siti Aminah", phone: "0857-7777-8888" },
  { name: "Distro Minuman Dingin", contact: "Andi Wijaya", phone: "0852-9999-0000" },
];

const ingredients = [
  { name: "Bawang Merah", unit: "kg" as const, stock: 50, minStock: 50, costPerUnit: 31_000, supplier: "Segar Tani Sayur" },
  { name: "Bawang Putih", unit: "kg" as const, stock: 50, minStock: 50, costPerUnit: 31_000, supplier: "Segar Tani Sayur" },
  { name: "Beras", unit: "kg" as const, stock: 50, minStock: 5, costPerUnit: 15_000, supplier: "Segar Tani Sayur" },
  { name: "Bumbu penyedap", unit: "gram" as const, stock: 30, minStock: 30, costPerUnit: 25, supplier: "Bumbu Dapur Prima" },
  { name: "Cabai Merah", unit: "gram" as const, stock: 30, minStock: 30, costPerUnit: 80, supplier: "Segar Tani Sayur" },
  { name: "Daging", unit: "kg" as const, stock: 15, minStock: 5, costPerUnit: 38_000, supplier: "Mitra Daging Nusantara" },
  { name: "Daun Bawang", unit: "gram" as const, stock: 1_000, minStock: 1_000, costPerUnit: 40, supplier: "Segar Tani Sayur" },
  { name: "Kecap Manis", unit: "ml" as const, stock: 1_000, minStock: 1_000, costPerUnit: 25, supplier: "Bumbu Dapur Prima" },
  { name: "Minyak Goreng", unit: "liter" as const, stock: 20, minStock: 10, costPerUnit: 30_000, supplier: "Bumbu Dapur Prima" },
  { name: "Telur", unit: "pcs" as const, stock: 100, minStock: 50, costPerUnit: 2_500, supplier: "Segar Tani Sayur" },
  { name: "Daging Ayam", unit: "kg" as const, stock: 10, minStock: 3, costPerUnit: 42_000, supplier: "Mitra Daging Nusantara" },
  { name: "Daging Bebek", unit: "kg" as const, stock: 5, minStock: 2, costPerUnit: 65_000, supplier: "Mitra Daging Nusantara" },
  { name: "Mie Telur", unit: "kg" as const, stock: 8, minStock: 3, costPerUnit: 25_000, supplier: "Bumbu Dapur Prima" },
  { name: "Tahu", unit: "pcs" as const, stock: 60, minStock: 20, costPerUnit: 2_500, supplier: "Segar Tani Sayur" },
  { name: "Kentang", unit: "kg" as const, stock: 5, minStock: 2, costPerUnit: 18_000, supplier: "Segar Tani Sayur" },
  { name: "Pisang", unit: "pcs" as const, stock: 40, minStock: 15, costPerUnit: 3_000, supplier: "Segar Tani Sayur" },
  { name: "Roti Tawar", unit: "pcs" as const, stock: 60, minStock: 20, costPerUnit: 2_000, supplier: "Bumbu Dapur Prima" },
  { name: "Coklat Batang", unit: "gram" as const, stock: 500, minStock: 200, costPerUnit: 60, supplier: "Bumbu Dapur Prima" },
  { name: "Keju", unit: "gram" as const, stock: 300, minStock: 100, costPerUnit: 100, supplier: "Bumbu Dapur Prima" },
  { name: "Alpukat", unit: "pcs" as const, stock: 30, minStock: 10, costPerUnit: 12_000, supplier: "Segar Tani Sayur" },
  { name: "Susu Kental Manis", unit: "ml" as const, stock: 2_000, minStock: 500, costPerUnit: 20, supplier: "Distro Minuman Dingin" },
  { name: "Gula Pasir", unit: "gram" as const, stock: 2_000, minStock: 500, costPerUnit: 15, supplier: "Distro Minuman Dingin" },
  { name: "Kopi Bubuk", unit: "gram" as const, stock: 500, minStock: 150, costPerUnit: 80, supplier: "Distro Minuman Dingin" },
  { name: "Teh Celup", unit: "pcs" as const, stock: 50, minStock: 15, costPerUnit: 500, supplier: "Distro Minuman Dingin" },
  { name: "Sirup Peach", unit: "ml" as const, stock: 1_000, minStock: 300, costPerUnit: 30, supplier: "Distro Minuman Dingin" },
  { name: "Tepung Terigu", unit: "kg" as const, stock: 5, minStock: 2, costPerUnit: 13_000, supplier: "Bumbu Dapur Prima" },
  { name: "Kacang Tanah", unit: "kg" as const, stock: 1, minStock: 0.3, costPerUnit: 30_000, supplier: "Bumbu Dapur Prima" },
  { name: "Santan", unit: "ml" as const, stock: 3_000, minStock: 500, costPerUnit: 15, supplier: "Bumbu Dapur Prima" },
  { name: "Madu", unit: "ml" as const, stock: 1_000, minStock: 300, costPerUnit: 50, supplier: "Bumbu Dapur Prima" },
  { name: "Gula Aren Cair", unit: "ml" as const, stock: 1_000, minStock: 300, costPerUnit: 25, supplier: "Distro Minuman Dingin" },
];

// Harga satuan bahan lama yang masih 0 supaya HPP di halaman resep masuk akal.
// Hanya mengisi yang nilainya 0 — perubahan harga manual admin tidak ditimpa.
const ingredientCostFixes = [
  { name: "Bumbu penyedap", costPerUnit: 25 },
  { name: "Cabai Merah", costPerUnit: 80 },
  { name: "Daun Bawang", costPerUnit: 40 },
  { name: "Kecap Manis", costPerUnit: 25 },
];

// Top-up sekali jalan untuk bahan lama yang stoknya terlalu kecil untuk demo.
// Ditulis sebagai StockMovement `in` (bukan menimpa stock langsung).
const demoStockTargets = [
  { name: "Bumbu penyedap", stock: 500 },
  { name: "Cabai Merah", stock: 500 },
  { name: "Kecap Manis", stock: 2_000 },
];

type DemoItem = { productIndex: number; quantity: number; note?: string };

// Skenario demo lintas layar: satu meja baru, satu sedang dimasak, satu siap
// disajikan. Seed ini hanya dipakai saat database belum punya sesi sama sekali.
const demoOpenSessions: {
  tableCode: string;
  orders: {
    status: "pending" | "confirmed" | "preparing" | "ready";
    kitchenStatus: "new" | "accepted" | "preparing" | "ready";
    minsAgo: number;
    items: DemoItem[];
  }[];
}[] = [
  {
    tableCode: "A01",
    orders: [
      {
        status: "preparing",
        kitchenStatus: "preparing",
        minsAgo: 14,
        items: [
          { productIndex: 1, quantity: 2, note: "Pedas sedang" },
          { productIndex: 2, quantity: 1 },
        ],
      },
      {
        status: "pending",
        kitchenStatus: "new",
        minsAgo: 4,
        items: [{ productIndex: 0, quantity: 1, note: "Tanpa es" }],
      },
    ],
  },
  {
    tableCode: "A03",
    orders: [
      {
        status: "ready",
        kitchenStatus: "ready",
        minsAgo: 18,
        items: [
          { productIndex: 4, quantity: 2 },
          { productIndex: 0, quantity: 1 },
        ],
      },
    ],
  },
  {
    tableCode: "B01",
    orders: [
      {
        status: "confirmed",
        kitchenStatus: "accepted",
        minsAgo: 7,
        items: [
          { productIndex: 3, quantity: 1 },
          { productIndex: 2, quantity: 2 },
        ],
      },
    ],
  },
  {
    tableCode: "C02",
    orders: [
      {
        status: "preparing",
        kitchenStatus: "preparing",
        minsAgo: 9,
        items: [{ productIndex: 1, quantity: 1 }],
      },
    ],
  },
];

const demoClosedSessions: {
  tableCode: string;
  method: "qris" | "cash";
  minsAgo: number;
  items: DemoItem[];
}[] = [
  {
    tableCode: "A02",
    method: "qris",
    minsAgo: 95,
    items: [
      { productIndex: 1, quantity: 1 },
      { productIndex: 2, quantity: 2 },
    ],
  },
  {
    tableCode: "A04",
    method: "cash",
    minsAgo: 180,
    items: [
      { productIndex: 4, quantity: 2 },
      { productIndex: 0, quantity: 1 },
    ],
  },
];

type DemoProduct = {
  id: string;
  name: string;
  price: number;
  category: { name: string; slug: string };
};

function buildDemoItems(specs: DemoItem[], products: DemoProduct[]) {
  return specs.map((spec) => {
    const product = products[spec.productIndex % products.length];
    return {
      productId: product.id,
      productName: product.name,
      quantity: spec.quantity,
      unitPrice: product.price,
      station: toDbStation(stationForCategory(product.category)),
      note: spec.note ?? "",
    };
  });
}

function demoTotals(items: ReturnType<typeof buildDemoItems>) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return { subtotal, total: subtotal };
}

async function main() {
  if (recipesOnly) {
    console.log(
      "Mode resep saja: user, meja, dan demo order dilewati."
    );
  } else {
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

  await seedInventory();
  await updateIngredientCosts();
  await ensureDemoStock();
  await seedRecipes();

  if (!recipesOnly) {
    await seedDemoOrders();
  }
}

// Resep demo eksplisit per nama produk. Hanya produk yang belum punya resep
// yang diisi, jadi komposisi buatan admin (mis. Nasi Goreng Wagyu) aman.
const productRecipes: {
  product: string;
  items: { ingredient: string; quantity: string }[];
}[] = [
  {
    product: "Ayam Bakar Madu Pesas",
    items: [
      { ingredient: "Daging Ayam", quantity: "0.20" },
      { ingredient: "Bawang Merah", quantity: "0.02" },
      { ingredient: "Bawang Putih", quantity: "0.01" },
      { ingredient: "Cabai Merah", quantity: "10" },
      { ingredient: "Kecap Manis", quantity: "30" },
      { ingredient: "Madu", quantity: "20" },
      { ingredient: "Gula Pasir", quantity: "5" },
      { ingredient: "Bumbu penyedap", quantity: "3" },
      { ingredient: "Minyak Goreng", quantity: "0.02" },
    ],
  },
  {
    product: "Ayam Goreng Kremes",
    items: [
      { ingredient: "Daging Ayam", quantity: "0.20" },
      { ingredient: "Tepung Terigu", quantity: "0.05" },
      { ingredient: "Telur", quantity: "0.5" },
      { ingredient: "Bawang Putih", quantity: "0.01" },
      { ingredient: "Bumbu penyedap", quantity: "3" },
      { ingredient: "Minyak Goreng", quantity: "0.05" },
    ],
  },
  {
    product: "Dimsum",
    items: [
      { ingredient: "Daging Ayam", quantity: "0.10" },
      { ingredient: "Tepung Terigu", quantity: "0.03" },
      { ingredient: "Telur", quantity: "0.5" },
      { ingredient: "Bawang Putih", quantity: "0.01" },
      { ingredient: "Bumbu penyedap", quantity: "2" },
      { ingredient: "Minyak Goreng", quantity: "0.01" },
    ],
  },
  {
    product: "Sate Ayam Madura",
    items: [
      { ingredient: "Daging Ayam", quantity: "0.15" },
      { ingredient: "Kacang Tanah", quantity: "0.03" },
      { ingredient: "Kecap Manis", quantity: "20" },
      { ingredient: "Bawang Merah", quantity: "0.01" },
      { ingredient: "Cabai Merah", quantity: "5" },
      { ingredient: "Gula Pasir", quantity: "5" },
    ],
  },
  {
    product: "Beef Black Paper Rice",
    items: [
      { ingredient: "Daging", quantity: "0.15" },
      { ingredient: "Beras", quantity: "0.20" },
      { ingredient: "Bawang Putih", quantity: "0.01" },
      { ingredient: "Kecap Manis", quantity: "20" },
      { ingredient: "Minyak Goreng", quantity: "0.02" },
      { ingredient: "Bumbu penyedap", quantity: "3" },
    ],
  },
  {
    product: "Nasi Bebek Penyet",
    items: [
      { ingredient: "Daging Bebek", quantity: "0.20" },
      { ingredient: "Beras", quantity: "0.20" },
      { ingredient: "Cabai Merah", quantity: "15" },
      { ingredient: "Bawang Merah", quantity: "0.02" },
      { ingredient: "Bawang Putih", quantity: "0.01" },
      { ingredient: "Minyak Goreng", quantity: "0.03" },
      { ingredient: "Bumbu penyedap", quantity: "3" },
    ],
  },
  {
    product: "Soto Betawi",
    items: [
      { ingredient: "Daging", quantity: "0.12" },
      { ingredient: "Santan", quantity: "100" },
      { ingredient: "Beras", quantity: "0.10" },
      { ingredient: "Kentang", quantity: "0.05" },
      { ingredient: "Daun Bawang", quantity: "5" },
      { ingredient: "Bawang Merah", quantity: "0.01" },
      { ingredient: "Bawang Putih", quantity: "0.01" },
      { ingredient: "Bumbu penyedap", quantity: "3" },
      { ingredient: "Minyak Goreng", quantity: "0.01" },
    ],
  },
  {
    product: "Bakmi Godog",
    items: [
      { ingredient: "Mie Telur", quantity: "0.15" },
      { ingredient: "Daging Ayam", quantity: "0.05" },
      { ingredient: "Telur", quantity: "1" },
      { ingredient: "Daun Bawang", quantity: "5" },
      { ingredient: "Kecap Manis", quantity: "10" },
      { ingredient: "Bawang Putih", quantity: "0.01" },
      { ingredient: "Bumbu penyedap", quantity: "2" },
      { ingredient: "Minyak Goreng", quantity: "0.01" },
    ],
  },
  {
    product: "Mie Goreng Jawa",
    items: [
      { ingredient: "Mie Telur", quantity: "0.15" },
      { ingredient: "Daging Ayam", quantity: "0.05" },
      { ingredient: "Telur", quantity: "1" },
      { ingredient: "Kecap Manis", quantity: "15" },
      { ingredient: "Cabai Merah", quantity: "5" },
      { ingredient: "Bawang Merah", quantity: "0.01" },
      { ingredient: "Bawang Putih", quantity: "0.01" },
      { ingredient: "Minyak Goreng", quantity: "0.02" },
    ],
  },
  {
    product: "Mie Pedas",
    items: [
      { ingredient: "Mie Telur", quantity: "0.15" },
      { ingredient: "Daging Ayam", quantity: "0.05" },
      { ingredient: "Telur", quantity: "1" },
      { ingredient: "Cabai Merah", quantity: "20" },
      { ingredient: "Bawang Putih", quantity: "0.01" },
      { ingredient: "Bumbu penyedap", quantity: "2" },
      { ingredient: "Minyak Goreng", quantity: "0.02" },
    ],
  },
  {
    product: "Es Teh Manis",
    items: [
      { ingredient: "Teh Celup", quantity: "1" },
      { ingredient: "Gula Pasir", quantity: "15" },
    ],
  },
  {
    product: "Ice Kopi Aren",
    items: [
      { ingredient: "Kopi Bubuk", quantity: "10" },
      { ingredient: "Gula Aren Cair", quantity: "20" },
      { ingredient: "Susu Kental Manis", quantity: "20" },
    ],
  },
  {
    product: "Ice Peach Blossom Tea",
    items: [
      { ingredient: "Teh Celup", quantity: "1" },
      { ingredient: "Sirup Peach", quantity: "30" },
      { ingredient: "Gula Pasir", quantity: "10" },
    ],
  },
  {
    product: "Jus Alpukat",
    items: [
      { ingredient: "Alpukat", quantity: "1" },
      { ingredient: "Susu Kental Manis", quantity: "30" },
      { ingredient: "Gula Pasir", quantity: "10" },
    ],
  },
  {
    product: "Kentang Goreng",
    items: [
      { ingredient: "Kentang", quantity: "0.15" },
      { ingredient: "Minyak Goreng", quantity: "0.05" },
      { ingredient: "Bumbu penyedap", quantity: "2" },
    ],
  },
  {
    product: "Pisang Goreng keju",
    items: [
      { ingredient: "Pisang", quantity: "1" },
      { ingredient: "Tepung Terigu", quantity: "0.05" },
      { ingredient: "Keju", quantity: "10" },
      { ingredient: "Gula Pasir", quantity: "5" },
      { ingredient: "Minyak Goreng", quantity: "0.05" },
    ],
  },
  {
    product: "Roti Bakar Coklat",
    items: [
      { ingredient: "Roti Tawar", quantity: "2" },
      { ingredient: "Coklat Batang", quantity: "20" },
      { ingredient: "Susu Kental Manis", quantity: "10" },
      { ingredient: "Minyak Goreng", quantity: "0.01" },
    ],
  },
  {
    product: "Tahu Crispy",
    items: [
      { ingredient: "Tahu", quantity: "2" },
      { ingredient: "Tepung Terigu", quantity: "0.05" },
      { ingredient: "Bumbu penyedap", quantity: "2" },
      { ingredient: "Minyak Goreng", quantity: "0.05" },
    ],
  },
];

const recipeByProduct = new Map(
  productRecipes.map((recipe) => [
    recipe.product.trim().toLowerCase(),
    recipe.items,
  ])
);

async function seedRecipes() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      _count: { select: { recipeItems: true } },
    },
  });

  if (products.length === 0) {
    console.log("Resep dilewati: belum ada produk di database.");
    return;
  }

  const ingredients = await prisma.ingredient.findMany({
    select: { id: true, name: true },
  });
  const ingredientIdByName = new Map(
    ingredients.map((ingredient) => [ingredient.name, ingredient.id])
  );

  for (const product of products) {
    if (product._count.recipeItems > 0) continue;

    const items = recipeByProduct.get(product.name.trim().toLowerCase());

    if (!items) {
      console.log(`Resep dilewati (belum ada mapping): ${product.name}`);
      continue;
    }

    const missing = items.find(
      (item) => !ingredientIdByName.has(item.ingredient)
    );
    if (missing) {
      console.warn(
        `Resep dilewati (bahan "${missing.ingredient}" tidak ditemukan): ${product.name}`
      );
      continue;
    }

    await prisma.recipeItem.createMany({
      data: items.map((item) => ({
        productId: product.id,
        ingredientId: ingredientIdByName.get(item.ingredient)!,
        quantity: item.quantity,
      })),
    });

    console.log(`Resep dibuat: ${product.name} (${items.length} bahan)`);
  }
}

async function seedInventory() {
  for (const supplier of suppliers) {
    const existing = await prisma.supplier.findUnique({
      where: { name: supplier.name },
      select: { id: true },
    });
    if (existing) {
      console.log(`Supplier sudah ada: ${supplier.name}`);
      continue;
    }

    await prisma.supplier.create({ data: supplier });
    console.log(`Supplier dibuat: ${supplier.name}`);
  }

  for (const ingredient of ingredients) {
    // Ensure-only: jangan reset stok bahan yang sudah ada. Perubahan stok
    // nyata dilakukan lewat mutasi di /admin/inventory dan wajib bertahan.
    const existing = await prisma.ingredient.findUnique({
      where: { name: ingredient.name },
      select: { id: true },
    });
    if (existing) {
      console.log(`Bahan sudah ada: ${ingredient.name}`);
      continue;
    }

    const supplier = await prisma.supplier.findUnique({
      where: { name: ingredient.supplier },
      select: { id: true },
    });

    await prisma.ingredient.create({
      data: {
        name: ingredient.name,
        unit: ingredient.unit,
        stock: ingredient.stock,
        minStock: ingredient.minStock,
        costPerUnit: ingredient.costPerUnit,
        supplierId: supplier?.id ?? null,
        movements: {
          create: {
            type: "in",
            quantity: ingredient.stock,
            stockBefore: 0,
            stockAfter: ingredient.stock,
            note: "Stok awal (seed)",
          },
        },
      },
    });
    console.log(`Bahan dibuat: ${ingredient.name}`);
  }
}

async function updateIngredientCosts() {
  for (const fix of ingredientCostFixes) {
    // Hanya isi harga yang masih 0; harga yang sudah diatur admin tidak ditimpa.
    const updated = await prisma.ingredient.updateMany({
      where: { name: fix.name, costPerUnit: 0 },
      data: { costPerUnit: fix.costPerUnit },
    });

    if (updated.count > 0) {
      console.log(
        `Harga bahan diperbarui: ${fix.name} = ${fix.costPerUnit}/unit`
      );
    }
  }
}

async function ensureDemoStock() {
  for (const target of demoStockTargets) {
    const ingredient = await prisma.ingredient.findUnique({
      where: { name: target.name },
      select: { id: true, name: true, stock: true, unit: true },
    });

    if (!ingredient) {
      console.log(`Top up dilewati: bahan ${target.name} tidak ada.`);
      continue;
    }

    const current = Number(ingredient.stock);
    if (current >= target.stock) {
      console.log(
        `Stok ${ingredient.name} sudah cukup: ${current} ${ingredient.unit}`
      );
      continue;
    }

    // Sekali jalan saja: kalau movement top-up sudah ada, jangan ulangi agar
    // pemakaian stok nyata setelah demo tidak tertutup.
    const alreadyToppedUp = await prisma.stockMovement.findFirst({
      where: {
        ingredientId: ingredient.id,
        type: "in",
        note: "Top up stok demo resep",
      },
      select: { id: true },
    });

    if (alreadyToppedUp) {
      console.log(
        `Top up ${ingredient.name} dilewati: sudah pernah dilakukan.`
      );
      continue;
    }

    const before = ingredient.stock;
    const after = target.stock;

    await prisma.$transaction(async (tx) => {
      const updated = await tx.ingredient.updateMany({
        where: { id: ingredient.id, stock: before },
        data: { stock: after },
      });

      if (updated.count === 0) {
        throw new Error(
          `Stok ${ingredient.name} berubah saat top up. Jalankan ulang seed.`
        );
      }

      await tx.stockMovement.create({
        data: {
          ingredientId: ingredient.id,
          type: "in",
          quantity: after - current,
          stockBefore: before,
          stockAfter: after,
          note: "Top up stok demo resep",
        },
      });
    });

    console.log(
      `Top up ${ingredient.name}: ${current} -> ${after} ${ingredient.unit}`
    );
  }
}

async function seedDemoOrders() {
  const existingSessions = await prisma.tableSession.count();
  if (existingSessions > 0) {
    console.log("Demo order dilewati: sudah ada sesi di database.");
    return;
  }

  const products = await prisma.product.findMany({
    take: 5,
    include: { category: { select: { name: true, slug: true } } },
  });

  if (products.length === 0) {
    console.log("Demo order dilewati: belum ada produk.");
    return;
  }

  const tableCodes = [
    ...demoOpenSessions.map((session) => session.tableCode),
    ...demoClosedSessions.map((session) => session.tableCode),
  ];

  const tables = await prisma.diningTable.findMany({
    where: { code: { in: tableCodes } },
    select: { id: true, code: true, seats: true },
  });
  const tableByCode = new Map(tables.map((table) => [table.code, table]));

  const cashier = await prisma.user.findFirst({
    where: { role: "cashier" },
    select: { id: true },
  });

  let orderSeq = 1;
  let paymentSeq = 1;

  for (const spec of demoOpenSessions) {
    const table = tableByCode.get(spec.tableCode);
    if (!table) {
      console.log(`Demo sesi dilewati: meja ${spec.tableCode} tidak ada.`);
      continue;
    }

    const latestMinsAgo = Math.max(
      ...spec.orders.map((order) => order.minsAgo),
      0
    );
    const openedAt = new Date(
      Date.now() - (latestMinsAgo + 5) * 60_000
    );

    await prisma.tableSession.create({
      data: {
        tableId: table.id,
        guests: Math.min(table.seats, 4),
        status: "open",
        openedAt,
        orders: {
          create: spec.orders.map((orderSpec) => {
            const items = buildDemoItems(orderSpec.items, products);
            const totals = demoTotals(items);

            return {
              code: `ORD-DEMO-${String(orderSeq++).padStart(3, "0")}`,
              tableCode: table.code,
              status: orderSpec.status,
              kitchenStatus: orderSpec.kitchenStatus,
              ...totals,
              note: "",
              createdAt: new Date(Date.now() - orderSpec.minsAgo * 60_000),
              items: { create: items },
            };
          }),
        },
      },
    });

    await prisma.diningTable.update({
      where: { id: table.id },
      data: { status: "occupied" },
    });

    console.log(`Demo sesi dibuat: ${table.code}`);
  }

  for (const spec of demoClosedSessions) {
    const table = tableByCode.get(spec.tableCode);
    if (!table) {
      console.log(`Demo pembayaran dilewati: meja ${spec.tableCode} tidak ada.`);
      continue;
    }

    const items = buildDemoItems(spec.items, products);
    const totals = demoTotals(items);
    const closedAt = new Date(Date.now() - spec.minsAgo * 60_000);
    const openedAt = new Date(closedAt.getTime() - 45 * 60_000);
    const amountReceived =
      spec.method === "cash"
        ? Math.ceil(totals.total / 50_000) * 50_000
        : null;

    await prisma.$transaction(async (tx) => {
      const session = await tx.tableSession.create({
        data: {
          tableId: table.id,
          guests: Math.min(table.seats, 4),
          status: "closed",
          billStatus: "paid",
          openedAt,
          closedAt,
        },
      });

      const order = await tx.order.create({
        data: {
          code: `ORD-DEMO-${String(orderSeq++).padStart(3, "0")}`,
          sessionId: session.id,
          tableCode: table.code,
          status: "completed",
          kitchenStatus: "ready",
          ...totals,
          note: "",
          createdAt: openedAt,
          items: { create: items },
        },
        select: { id: true },
      });

      const payment = await tx.payment.create({
        data: {
          code: `PAY-DEMO-${String(paymentSeq++).padStart(3, "0")}`,
          sessionId: session.id,
          amount: totals.total,
          method: spec.method,
          status: "paid",
          amountReceived,
          change:
            amountReceived !== null
              ? amountReceived - totals.total
              : null,
          cashierId: cashier?.id ?? null,
          paidAt: closedAt,
        },
        select: { id: true },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { paymentId: payment.id },
      });
    });

    console.log(`Demo pembayaran dibuat: ${table.code}`);
  }
}

main().catch((error) => {
  console.error("Seeder gagal:", error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
