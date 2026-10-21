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

export type PaymentMethod = "CASH" | "QRIS" | "DEBIT" | "CREDIT" | "EWALLET";

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
  sessionToken: string;
  tableCode: string;
  items: OrderItem[];
  createdAt: string;
  status: OrderStatus;
  kitchenStatus: KitchenStatus;
  note: string;
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
