// Mock data terpusat — PRD §27. Konsistensi lintas halaman adalah aturan:
// jika meja A01 OCCUPIED, order & session yang sama harus muncul di
// kitchen, cashier, dan admin. Jangan menyalin data per-halaman.

import type {
  Branch,
  Category,
  DiningTable,
  Ingredient,
  Modifier,
  ModifierGroup,
  Order,
  Payment,
  Product,
  Restaurant,
  Shift,
  Staff,
  Supplier,
  TableSession,
} from "./types";

// Semua timestamp digeser relatif terhadap waktu muat modul, sehingga timer
// (PRD §8/§9) selalu masuk akal kapan pun prototype dijalankan. Offset
// relatif antar data tetap mengikuti skenario semula (PRD §27).
const REF = Date.parse("2026-10-06T13:00:00");
const at = (iso: string) =>
  new Date(Date.parse(iso) - REF + Date.now()).toISOString();
const minsAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const dayStr = (daysAgo: number) => {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const restaurant: Restaurant = {
  id: "rst-001",
  name: "RestoFlow Bistro",
  logoText: "RF",
  tagline: "Dapur panas, layanan cepat",
};

export const branches: Branch[] = [
  {
    id: "br-01",
    restaurantId: "rst-001",
    name: "Cabang Senopati",
    address: "Jl. Senopati No. 12, Jakarta Selatan",
  },
  {
    id: "br-02",
    restaurantId: "rst-001",
    name: "Cabang Kelapa Gading",
    address: "Jl. Boulevard Blok QA No. 3, Jakarta Utara",
  },
];

export const categories: Category[] = [
  { id: "cat-1", name: "Semua", icon: "utensils" },
  { id: "cat-2", name: "Nasi", icon: "bowl" },
  { id: "cat-3", name: "Mie", icon: "soup" },
  { id: "cat-4", name: "Minuman", icon: "cup" },
  { id: "cat-5", name: "Camilan", icon: "cookie" },
];

export const modifiers: Modifier[] = [
  { id: "mod-1", name: "Level 1", priceDelta: 0 },
  { id: "mod-2", name: "Level 2", priceDelta: 0 },
  { id: "mod-3", name: "Level 3", priceDelta: 2000 },
  { id: "mod-4", name: "Level 4", priceDelta: 3000 },
  { id: "mod-5", name: "Telur", priceDelta: 5000 },
  { id: "mod-6", name: "Keju", priceDelta: 4000 },
  { id: "mod-7", name: "Es", priceDelta: 0 },
  { id: "mod-8", name: "Tanpa Es", priceDelta: 0 },
  { id: "mod-9", name: "Extra Pedas", priceDelta: 2000 },
  { id: "mod-10", name: "Porsi Besar", priceDelta: 8000 },
  { id: "mod-11", name: "Normal", priceDelta: 0 },
  { id: "mod-12", name: "Gula Sedikit", priceDelta: 0 },
];

export const modifierGroups: ModifierGroup[] = [
  {
    id: "mg-1",
    name: "Level Pedas",
    required: true,
    maxPick: 1,
    options: modifiers.slice(0, 4),
  },
  {
    id: "mg-2",
    name: "Tambahan",
    required: false,
    maxPick: 3,
    options: [
      modifiers[4],
      modifiers[5],
      modifiers[8],
      modifiers[9],
    ],
  },
  {
    id: "mg-3",
    name: "Es & Gula",
    required: true,
    maxPick: 1,
    options: [modifiers[6], modifiers[7], modifiers[11]],
  },
];

export const products: Product[] = [
  { id: "prd-1", categoryId: "cat-2", name: "Nasi Goreng Wagyu", description: "Nasi goreng aroma wok dengan irisannya wagyu MB5, telur mata sapi renyah.", price: 45000, imageEmoji: "🍛", available: true, popular: true, modifierGroupIds: ["mg-2"] },
  { id: "prd-2", categoryId: "cat-2", name: "Ayam Bakar Madu Pedas", description: "Paha ayam bakar empuk marinasi rempah kelapa madu hutan.", price: 35000, imageEmoji: "🍗", available: true, popular: true, modifierGroupIds: ["mg-1", "mg-2"] },
  { id: "prd-3", categoryId: "cat-2", name: "Beef Blackpepper Rice", description: "Daging sapi siram saus blackpepper hitam pekat, sayur brokoli.", price: 42000, imageEmoji: "🍚", available: true, modifierGroupIds: ["mg-2"] },
  { id: "prd-4", categoryId: "cat-2", name: "Ayam Goreng Kremes", description: "Ayam kampung goreng tepung kremes renyah, sambal terasi.", price: 32000, imageEmoji: "🍗", available: true, modifierGroupIds: ["mg-2"] },
  { id: "prd-5", categoryId: "cat-2", name: "Nasi Bebek Penyet", description: "Bebek goreng penyet sambal bawang, lalapan segar.", price: 38000, imageEmoji: "🍛", available: false, modifierGroupIds: ["mg-1"] },
  { id: "prd-6", categoryId: "cat-3", name: "Mie Pedas Lv 2", description: "Mie godog Jawa level 2 dengan topping telur & sawi.", price: 18000, imageEmoji: "🍜", available: true, popular: true, modifierGroupIds: ["mg-1", "mg-2"] },
  { id: "prd-7", categoryId: "cat-3", name: "Mie Goreng Jawa", description: "Mie goreng manis gurih telur, sawi, dan bakso.", price: 16000, imageEmoji: "🍜", available: true, modifierGroupIds: ["mg-2"] },
  { id: "prd-8", categoryId: "cat-3", name: "Dimsum Ayam (5 pcs)", description: "Dimsum kukus isi ayam, saus tiram pedas.", price: 22000, imageEmoji: "🥟", available: true, popular: true, modifierGroupIds: ["mg-2"] },
  { id: "prd-9", categoryId: "cat-3", name: "Bakmi Godog", description: "Bakmi rebus kuah bening kaldu ayam kampung.", price: 20000, imageEmoji: "🍜", available: true, modifierGroupIds: ["mg-2"] },
  { id: "prd-10", categoryId: "cat-4", name: "Ice Peach Blossom Tea", description: "Teh melati cold brew dengan puree buah peach.", price: 15000, imageEmoji: "🧋", available: true, popular: true, modifierGroupIds: ["mg-3"] },
  { id: "prd-11", categoryId: "cat-4", name: "Es Kopi Aren", description: "Espresso susu gula aren aren, ice cube besar.", price: 18000, imageEmoji: "☕", available: true, popular: true, modifierGroupIds: ["mg-3"] },
  { id: "prd-12", categoryId: "cat-4", name: "Es Teh Manis", description: "Teh melati dingin manis klasik.", price: 8000, imageEmoji: "🥤", available: true, modifierGroupIds: ["mg-3"] },
  { id: "prd-13", categoryId: "cat-4", name: "Jus Alpukat", description: "Alpukat segar blender, susu kental manis, keju parut.", price: 20000, imageEmoji: "🥑", available: true, modifierGroupIds: ["mg-3"] },
  { id: "prd-14", categoryId: "cat-4", name: "Air Mineral", description: "Air mineral gelas 600ml.", price: 5000, imageEmoji: "💧", available: true, modifierGroupIds: [] },
  { id: "prd-15", categoryId: "cat-5", name: "Tahu Crispy", description: "Tahu goreng tepung kering sambal matah.", price: 12000, imageEmoji: "🧆", available: true, modifierGroupIds: ["mg-2"] },
  { id: "prd-16", categoryId: "cat-5", name: "Kentang Goreng", description: "French fries crisp dengan saus mayonnaise.", price: 14000, imageEmoji: "🍟", available: true, popular: true, modifierGroupIds: ["mg-2"] },
  { id: "prd-17", categoryId: "cat-5", name: "Pisang Goreng Keju", description: "Pisang goreng madu tabur keju mozarella.", price: 16000, imageEmoji: "🍌", available: true, modifierGroupIds: [] },
  { id: "prd-18", categoryId: "cat-5", name: "Roti Bakar Cokelat", description: "Roti bakar isi cokelat keju, susu kental.", price: 15000, imageEmoji: "🍞", available: true, modifierGroupIds: [] },
  { id: "prd-19", categoryId: "cat-2", name: "Sate Ayam Madura", description: "Sate ayam 10 tusuk, bumbu kacang, lontong.", price: 30000, imageEmoji: "🍢", available: true, modifierGroupIds: ["mg-2"] },
  { id: "prd-20", categoryId: "cat-3", name: "Soto Betawi", description: "Soto betawi kuah susu, daging sapi, kentang.", price: 28000, imageEmoji: "🍲", available: true, modifierGroupIds: ["mg-1", "mg-2"] },
];

export const tables: DiningTable[] = [
  { id: "tbl-1", code: "A01", seats: 4, area: "Indoor", status: "OCCUPIED", sessionToken: "sess_a01_9842" },
  { id: "tbl-2", code: "A02", seats: 4, area: "Indoor", status: "AVAILABLE", sessionToken: "" },
  { id: "tbl-3", code: "A03", seats: 2, area: "Indoor", status: "WAITING_PAYMENT", sessionToken: "sess_a03_9838" },
  { id: "tbl-4", code: "A04", seats: 4, area: "Indoor", status: "AVAILABLE", sessionToken: "" },
  { id: "tbl-5", code: "A05", seats: 6, area: "Indoor", status: "RESERVED", sessionToken: "" },
  { id: "tbl-6", code: "B01", seats: 4, area: "Teras", status: "OCCUPIED", sessionToken: "sess_b01_9839" },
  { id: "tbl-7", code: "B02", seats: 2, area: "Teras", status: "AVAILABLE", sessionToken: "" },
  { id: "tbl-8", code: "B03", seats: 4, area: "Teras", status: "CLEANING", sessionToken: "" },
  { id: "tbl-9", code: "C01", seats: 8, area: "VIP", status: "AVAILABLE", sessionToken: "" },
  { id: "tbl-10", code: "C02", seats: 8, area: "VIP", status: "OCCUPIED", sessionToken: "sess_c02_9843" },
];

export const sessions: TableSession[] = [
  { id: "ses-1", tableId: "tbl-1", guests: 2, startedAt: at("2026-10-06T11:40:00"), billStatus: "NOT_REQUESTED", orderIds: ["ord-1", "ord-4"] },
  { id: "ses-2", tableId: "tbl-3", guests: 3, startedAt: at("2026-10-06T11:12:00"), billStatus: "REQUESTED", orderIds: ["ord-2"] },
  { id: "ses-3", tableId: "tbl-6", guests: 2, startedAt: at("2026-10-06T11:55:00"), billStatus: "NOT_REQUESTED", orderIds: ["ord-3"] },
  { id: "ses-4", tableId: "tbl-10", guests: 5, startedAt: at("2026-10-06T12:02:00"), billStatus: "NOT_REQUESTED", orderIds: ["ord-5"] },
];

const station = (p: string) => (p === "cat-4" ? "Bar" : p === "cat-3" ? "Wok" : "Grill");

function item(
  order: string,
  idx: number,
  productId: string,
  qty: number,
  extra: Partial<Order["items"][number]> = {}
) {
  const p = products.find((x) => x.id === productId)!;
  return {
    id: `${order}-it-${idx}`,
    productId,
    productName: p.name,
    quantity: qty,
    unitPrice: p.price,
    modifierNames: [] as string[],
    modifierDelta: 0,
    note: "",
    station: station(p.categoryId),
    ...extra,
  };
}

export const orders: Order[] = [
  {
    id: "ord-1", code: "ORD-20261006-001", sessionToken: "sess_a01_9842", tableCode: "A01",
    items: [
      item("ord-1", 1, "prd-1", 1, { modifierNames: ["Telur"], modifierDelta: 5000 }),
      item("ord-1", 2, "prd-10", 1, { modifierNames: ["Es"], note: "Pedas sedang, es sedikit" }),
    ],
    createdAt: at("2026-10-06T12:43:00"), status: "PREPARING", kitchenStatus: "PREPARING",
    note: "Tolong dipisah piring",
  },
  {
    id: "ord-2", code: "ORD-20261006-002", sessionToken: "sess_a03_9838", tableCode: "A03",
    items: [
      item("ord-2", 1, "prd-6", 2, { modifierNames: ["Level 3"], modifierDelta: 2000 }),
      item("ord-2", 2, "prd-12", 2),
    ],
    createdAt: at("2026-10-06T12:31:00"), status: "READY", kitchenStatus: "READY", note: "",
  },
  {
    id: "ord-3", code: "ORD-20261006-003", sessionToken: "sess_b01_9839", tableCode: "B01",
    items: [
      item("ord-3", 1, "prd-4", 1),
      item("ord-3", 2, "prd-8", 1),
      item("ord-3", 3, "prd-11", 2, { modifierNames: ["Gula Sedikit"] }),
    ],
    createdAt: at("2026-10-06T12:47:00"), status: "CONFIRMED", kitchenStatus: "NEW", note: "",
  },
  {
    id: "ord-4", code: "ORD-20261006-004", sessionToken: "sess_a01_9842", tableCode: "A01",
    items: [
      item("ord-4", 1, "prd-2", 1, { modifierNames: ["Level 2"], modifierDelta: 0, note: "Sambal dipisah" }),
      item("ord-4", 2, "prd-16", 1),
    ],
    createdAt: at("2026-10-06T12:51:00"), status: "PENDING", kitchenStatus: "NEW", note: "",
  },
  {
    id: "ord-5", code: "ORD-20261006-005", sessionToken: "sess_c02_9843", tableCode: "C02",
    items: [
      item("ord-5", 1, "prd-3", 2, { modifierNames: ["Porsi Besar"], modifierDelta: 8000 }),
      item("ord-5", 2, "prd-13", 3),
      item("ord-5", 3, "prd-17", 1),
    ],
    createdAt: at("2026-10-06T12:38:00"), status: "PREPARING", kitchenStatus: "ACCEPTED",
    note: "Ulang tahun — tanpa lilin",
  },
  {
    id: "ord-6", code: "ORD-20261006-006", sessionToken: "sess_x_9835", tableCode: "B02",
    items: [item("ord-6", 1, "prd-9", 1), item("ord-6", 2, "prd-15", 1)],
    createdAt: at("2026-10-06T12:20:00"), status: "COMPLETED", kitchenStatus: "READY", note: "",
  },
  {
    id: "ord-7", code: "ORD-20261006-007", sessionToken: "sess_x_9831", tableCode: "A04",
    items: [item("ord-7", 1, "prd-19", 1), item("ord-7", 2, "prd-12", 1)],
    createdAt: at("2026-10-06T11:58:00"), status: "COMPLETED", kitchenStatus: "READY", note: "",
  },
  {
    id: "ord-8", code: "ORD-20261006-008", sessionToken: "sess_x_9828", tableCode: "C01",
    items: [item("ord-8", 1, "prd-20", 2, { modifierNames: ["Level 1"] })],
    createdAt: at("2026-10-06T11:44:00"), status: "COMPLETED", kitchenStatus: "READY", note: "",
  },
];

// 15 pembayaran — PRD §27
export const payments: Payment[] = Array.from({ length: 15 }, (_, i) => {
  const methods = ["QRIS", "CASH", "DEBIT", "EWALLET", "CREDIT"] as const;
  const order = orders[i % orders.length];
  return {
    id: `pay-${i + 1}`,
    code: `PAY-${String(i + 1).padStart(3, "0")}`,
    orderId: order.id,
    tableCode: order.tableCode,
    amount: order.items.reduce(
      (s, it) => s + (it.unitPrice + it.modifierDelta) * it.quantity,
      0
    ),
    method: methods[i % methods.length],
    paidAt: minsAgo((15 - i) * 8 + 2),
  };
});

export const suppliers: Supplier[] = [
  { id: "sup-1", name: "Segar Tani Sayur", contact: "Pak Handoko", phone: "0812-1111-2222" },
  { id: "sup-2", name: "Mitra Daging Nusantara", contact: "Ibu Ratna", phone: "0813-3333-4444" },
  { id: "sup-3", name: "Seafood Bahari Jaya", contact: "Pak Yudi", phone: "0821-5555-6666" },
  { id: "sup-4", name: "Bumbu Dapur Prima", contact: "Siti Aminah", phone: "0857-7777-8888" },
  { id: "sup-5", name: "Distro Minuman Dingin", contact: "Andi Wijaya", phone: "0852-9999-0000" },
];

export const ingredients: Ingredient[] = [
  { id: "ing-1", name: "Daging Ayam Fillet", unit: "kg", stock: 4.2, minStock: 5, supplierId: "sup-2" },
  { id: "ing-2", name: "Bumbu Sambal Bawang", unit: "kg", stock: 1.5, minStock: 3, supplierId: "sup-4" },
  { id: "ing-3", name: "Beras Pandan Wangi", unit: "kg", stock: 18, minStock: 10, supplierId: "sup-1" },
  { id: "ing-4", name: "Daun Teh Peach Blossom", unit: "pack", stock: 12, minStock: 4, supplierId: "sup-5" },
  { id: "ing-5", name: "Cabai Rawit Merah", unit: "kg", stock: 2.4, minStock: 3, supplierId: "sup-1" },
  { id: "ing-6", name: "Sapi Blackpepper", unit: "kg", stock: 6.8, minStock: 4, supplierId: "sup-2" },
  { id: "ing-7", name: "Udang Segar", unit: "kg", stock: 3.5, minStock: 2, supplierId: "sup-3" },
  { id: "ing-8", name: "Telur Ayam", unit: "kg", stock: 9, minStock: 6, supplierId: "sup-1" },
  { id: "ing-9", name: "Gula Aren Cair", unit: "liter", stock: 5.5, minStock: 3, supplierId: "sup-5" },
  { id: "ing-10", name: "Minyak Goreng", unit: "liter", stock: 11, minStock: 8, supplierId: "sup-4" },
];

export const staff: Staff[] = [
  { id: "stf-1", name: "Rian Pratama", role: "KASIR", shift: "Siang", active: true },
  { id: "stf-2", name: "Chef Dimas", role: "KITCHEN", shift: "Siang", active: true },
  { id: "stf-3", name: "Chef Eko", role: "KITCHEN", shift: "Malam", active: true },
  { id: "stf-4", name: "Budi Santoso", role: "WAITER", shift: "Siang", active: true },
  { id: "stf-5", name: "Maya Lestari", role: "WAITER", shift: "Malam", active: false },
  { id: "stf-6", name: "Dewi Anggraini", role: "ADMIN", shift: "Siang", active: true },
  { id: "stf-7", name: "Fajar Nugroho", role: "BARISTA", shift: "Siang", active: true },
  { id: "stf-8", name: "Sari Rahmawati", role: "KASIR", shift: "Malam", active: false },
];

export const shifts: Shift[] = [
  { id: "shf-1", staffId: "stf-1", date: dayStr(0), clockIn: "11:00", clockOut: null },
  { id: "shf-2", staffId: "stf-2", date: dayStr(0), clockIn: "10:00", clockOut: null },
  { id: "shf-3", staffId: "stf-4", date: dayStr(0), clockIn: "11:00", clockOut: null },
  { id: "shf-4", staffId: "stf-7", date: dayStr(0), clockIn: "11:00", clockOut: null },
  { id: "shf-5", staffId: "stf-6", date: dayStr(0), clockIn: "09:00", clockOut: null },
  { id: "shf-6", staffId: "stf-8", date: dayStr(1), clockIn: "18:00", clockOut: "23:00" },
  { id: "shf-7", staffId: "stf-5", date: dayStr(1), clockIn: "18:00", clockOut: "23:30" },
  { id: "shf-8", staffId: "stf-3", date: dayStr(1), clockIn: "16:00", clockOut: "23:00" },
];

// Formatter dipindah ke lib/format.ts; re-export menjaga import lama tetap
// berjalan selama layar mock belum dimigrasikan.
export { rupiah } from "./format";
