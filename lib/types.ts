// Domain types — PRD §31. Satu sumber kebenaran untuk seluruh mock data.

export type TableStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "WAITING_PAYMENT"
  | "RESERVED"
  | "CLEANING";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type KitchenStatus = "NEW" | "ACCEPTED" | "PREPARING" | "READY";

export type BillStatus =
  | "NOT_REQUESTED"
  | "REQUESTED"
  | "PROCESSING"
  | "PAID";

export type PaymentMethod = "QRIS" | "CASH";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type TrackingStep =
  | "ORDER_RECEIVED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED";

export interface Restaurant {
  id: string;
  name: string;
  logoText: string;
  tagline: string;
}

export interface Branch {
  id: string;
  restaurantId: string;
  name: string;
  address: string;
}

export interface DiningTable {
  id: string;
  code: string;
  seats: number;
  area: string;
  status: TableStatus;
  sessionToken: string;
}

export interface TableSession {
  id: string;
  tableId: string;
  guests: number;
  startedAt: string;
  billStatus: BillStatus;
  orderIds: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Modifier {
  id: string;
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  maxPick: number;
  options: Modifier[];
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageEmoji: string;
  available: boolean;
  popular?: boolean;
  modifierGroupIds: string[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  modifierNames: string[];
  modifierDelta: number;
  note: string;
  station: string;
}

export interface Order {
  id: string;
  code: string;
  sessionId?: string;
  sessionToken: string;
  tableCode: string;
  items: OrderItem[];
  createdAt: string;
  status: OrderStatus;
  kitchenStatus: KitchenStatus;
  note: string;
  subtotal?: number;
  total?: number;
}

export interface Payment {
  id: string;
  code: string;
  orderId: string;
  tableCode: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
}

// View model pembayaran yang sudah dibaca dari database. Satu pembayaran
// terikat ke sesi meja dan bisa mencakup beberapa order yang dipilih kasir.
export interface PaymentView {
  id: string;
  code: string;
  sessionId: string;
  tableCode: string;
  orderCodes: string[];
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  cashierName: string | null;
}

export interface ReceiptItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  note: string;
}

export interface ReceiptOrder {
  code: string;
  createdAt: string;
  items: ReceiptItem[];
}

// Kwitansi melekat ke satu Payment, bukan ke seluruh sesi meja. Satu payment
// bisa mencakup beberapa order yang dipilih kasir.
export interface ReceiptView {
  paymentCode: string;
  paidAt: string;
  tableCode: string;
  cashierName: string | null;
  method: PaymentMethod;
  amount: number;
  amountReceived: number | null;
  change: number | null;
  orders: ReceiptOrder[];
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
}

export interface Staff {
  id: string;
  name: string;
  role: "KASIR" | "KITCHEN" | "WAITER" | "ADMIN" | "BARISTA";
  shift: string;
  active: boolean;
}

export interface Shift {
  id: string;
  staffId: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
}

// View model khusus menu tamu yang kini dibaca dari database. Tipe `Product`
// di atas tetap dipakai layar yang masih mock agar migrasi berjalan bertahap.
export type MenuStation = "Grill" | "Wok" | "Bar";

export interface MenuCategory {
  id: string;
  name: string;
}

export interface MenuProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  station: MenuStation;
}
