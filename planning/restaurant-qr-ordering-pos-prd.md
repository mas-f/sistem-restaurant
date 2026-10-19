# PRD — Restaurant QR Ordering & POS System

**Document Type:** Product Requirements Document  
**Version:** 1.0  
**Status:** Frontend Prototype  
**Scope:** Frontend/UI/UX only  
**Primary Stack:** Next.js, TypeScript, Tailwind CSS, shadcn/ui

---

## 1. Product Overview

Restaurant QR Ordering & POS System adalah aplikasi web untuk mensimulasikan operasional restoran modern yang menggunakan QR code pada setiap meja.

Customer dapat memindai QR code meja, melihat menu, memilih makanan, membuat pesanan, memantau status pesanan, dan meminta bill.

Di sisi internal, staff restoran memiliki dashboard untuk menerima dan memproses pesanan di dapur, mengelola pembayaran, memantau meja, mengelola menu, inventory, staff, dan laporan penjualan.

Pada fase PRD ini, sistem hanya berfokus pada **frontend prototype**. Backend, database, authentication, payment gateway, dan realtime infrastructure belum diimplementasikan.

---



# 2. Product Goals



## 2.1 Primary Goals

1. Membuat prototype frontend restoran yang terasa seperti produk production-grade.
2. Mensimulasikan alur customer dari scan QR sampai request bill.
3. Mensimulasikan alur kitchen dari order baru sampai order ready.
4. Mensimulasikan alur cashier dari pemilihan meja sampai pembayaran.
5. Menyediakan admin dashboard untuk operasional restoran.
6. Membuat UI responsive untuk customer dan staff.
7. Menggunakan reusable components dan struktur kode yang mudah dikembangkan menjadi aplikasi full-stack.



## 2.2 Secondary Goals

- Menjadi portfolio project web developer.
- Menunjukkan kemampuan membangun multi-role interface.
- Menunjukkan kemampuan membuat stateful frontend workflow.
- Menjadi fondasi untuk tahap berikutnya: PostgreSQL, Prisma, API, authentication, dan realtime.

---



# 4. Target Users



## 4.1 Customer

Customer restoran yang menggunakan smartphone untuk melakukan pemesanan melalui QR code meja.

Kebutuhan utama:

- Melihat menu.
- Mencari makanan.
- Memilih makanan.
- Mengatur quantity.
- Memilih modifier.
- Menambahkan catatan.
- Melakukan order.
- Melihat status order.
- Meminta bill.



## 4.2 Kitchen Staff

Staff dapur yang menerima dan memproses pesanan.

Kebutuhan utama:

- Melihat order baru.
- Melihat nomor meja.
- Melihat item dan modifier.
- Mengubah status order.
- Melihat waktu order.
- Menandai order sebagai ready.



## 4.3 Cashier

Staff kasir yang menangani pembayaran.

Kebutuhan utama:

- Melihat status meja.
- Memilih meja.
- Melihat seluruh order aktif pada meja.
- Melihat total bill.
- Memilih metode pembayaran.
- Menyelesaikan pembayaran.



## 4.4 Admin/Manager

Pengelola restoran.

Kebutuhan utama:

- Melihat performa restoran.
- Mengelola meja.
- Mengelola menu.
- Mengelola kategori.
- Mengelola inventory.
- Mengelola supplier.
- Melihat order.
- Melihat pembayaran.
- Mengelola staff.
- Mengelola shift.

---



# 5. Core Business Concept

Sistem harus menggunakan konsep:

```text
Restaurant
    ↓
Branch
    ↓
Table
    ↓
Table Session
    ↓
Order
    ↓
Order Items
```

Satu meja dapat memiliki banyak order selama satu sesi makan.

Contoh:

```text
Table A01
└── Session #5001
    ├── Order #1001
    │   ├── Mie x2
    │   └── Es Teh x2
    │
    ├── Order #1002
    │   └── Dimsum x1
    │
    └── Payment
        └── Rp75.000
```

Konsep ini harus tercermin dalam UI walaupun backend belum tersedia.

---



# 6. Product Experience



## 6.1 Customer Experience

Flow utama:

```text
Scan QR
    ↓
Identify Table
    ↓
Browse Menu
    ↓
Product Detail
    ↓
Add to Cart
    ↓
Review Cart
    ↓
Place Order
    ↓
Order Confirmation
    ↓
Track Order
    ↓
Request Bill
```



## 6.2 Kitchen Experience

```text
New Order
    ↓
Accept
    ↓
Preparing
    ↓
Ready
    ↓
Completed
```



## 6.3 Cashier Experience

```text
View Tables
    ↓
Select Table
    ↓
View Active Session
    ↓
View Orders
    ↓
View Bill
    ↓
Select Payment Method
    ↓
Complete Payment
    ↓
Payment Success
```



## 6.4 Admin Experience

```text
Dashboard
    ↓
Monitor Restaurant
    ↓
Manage Tables
    ↓
Manage Menu
    ↓
Manage Inventory
    ↓
Manage Staff
    ↓
View Orders
    ↓
View Payments
    ↓
View Reports
```

---



# 7. Functional Requirements



# 7.1 Customer Ordering



### Route

```text
/order/table/[token]
```



### Requirements

Customer harus dapat:

- Melihat restaurant logo.
- Melihat restaurant name.
- Melihat nomor meja.
- Melihat kategori menu.
- Melihat product list.
- Mencari produk.
- Melihat product detail.
- Memilih quantity.
- Memilih modifier.
- Menambahkan notes.
- Menambahkan produk ke cart.
- Melihat cart summary.



### UI Components

- Restaurant Header.
- Table Badge.
- Search Input.
- Category Tabs.
- Product Card.
- Product Detail Dialog.
- Modifier Selector.
- Quantity Selector.
- Floating Cart Bar.

---



# 7.2 Product Detail



### Requirements

Product detail harus menampilkan:

- Product image.
- Product name.
- Description.
- Base price.
- Availability.
- Modifier groups.
- Quantity.
- Special notes.
- Total calculated price.



### Example

```text
Mie Pedas Lv 2

Rp15.000

Level Pedas
○ Level 1
● Level 2
○ Level 3
○ Level 4

Tambahan
☐ Telur +Rp5.000
☐ Keju +Rp4.000

Catatan
"Jangan terlalu pedas"

Quantity
[-] 2 [+]

[Add to Cart — Rp40.000]
```

---



# 7.3 Customer Cart



### Route

```text
/order/cart
```



### Requirements

Cart harus menampilkan:

- Product.
- Quantity.
- Modifier.
- Notes.
- Unit price.
- Subtotal.
- Discount.
- Tax.
- Service charge.
- Grand total.

Customer dapat:

- Mengubah quantity.
- Menghapus item.
- Mengedit item.
- Menambahkan notes.
- Melakukan checkout/order.



### Primary CTA

```text
Place Order
```

---



# 7.4 Order Confirmation



### Route

```text
/order/success
```



### Requirements

Tampilkan:

- Success indicator.
- Order number.
- Table number.
- Order time.
- Ordered items.
- Total.
- Estimated preparation time.
- Current order status.

Example:

```text
Order Confirmed

#ORD-20261006-001
Table A01

Estimated time
15–20 minutes

[Track My Order]
```

---



# 7.5 Order Tracking



### Route

```text
/order/[orderId]
```



### Requirements

Customer dapat melihat status order.

Status:

```text
ORDER_RECEIVED
CONFIRMED
PREPARING
READY
COMPLETED
```



### UI

Gunakan vertical atau horizontal progress tracker.

Example:

```text
✓ Order Received
     ↓
✓ Confirmed
     ↓
● Preparing
     ↓
○ Ready
     ↓
○ Completed
```

Tambahkan:

- Order items.
- Table number.
- Order number.
- Order time.
- Total amount.
- Estimated time.

---



# 7.6 Request Bill

Customer dapat menekan:

```text
Request Bill
```

Sistem menampilkan confirmation dialog.

### Initial State

```text
Request Bill
```



### Confirmation

```text
Are you sure you want to request your bill?

[Cancel] [Request Bill]
```



### After Request

```text
Bill Requested

Please wait for the cashier.
```

Status dapat berupa:

```text
NOT_REQUESTED
REQUESTED
PROCESSING
PAID
```

---



# 8. Kitchen Display System



### Route

```text
/staff/kitchen
```

KDS harus menjadi dashboard desktop-first.

## 8.1 Layout

Gunakan four-column workflow:

```text
NEW
    ↓
ACCEPTED
    ↓
PREPARING
    ↓
READY
```

Setiap kolom menampilkan order cards.

## 8.2 Kitchen Order Card

Informasi:

- Order number.
- Table number.
- Time elapsed.
- Items.
- Quantity.
- Modifiers.
- Customer notes.
- Priority.
- Status.
- Action buttons.

Example:

```text
#ORD-10231
TABLE A01

2x Mie Pedas Lv 2
   Level 3

1x Dimsum
   Extra Sauce

2x Es Teh

00:08

[Accept]
```



## 8.3 Kitchen Interactions

Staff dapat:

```text
New
 ↓ Accept
Accepted
 ↓ Start
Preparing
 ↓ Complete
Ready
```

Tambahkan:

- New order notification.
- Visual priority indicator.
- Timer.
- Station filter.
- Search.
- Status filter.

---



# 9. Cashier / POS



### Route

```text
/staff/cashier
```



## 9.1 Table Panel

Tampilkan seluruh meja.

Status:

- Available.
- Occupied.
- Waiting Payment.
- Reserved.
- Cleaning.

Example:

```text
A01
Occupied

A02
Available

A03
Waiting Payment
```



## 9.2 Bill Panel

Ketika meja dipilih:

```text
TABLE A01

Order #1001
Mie x2
Es Teh x2

Order #1002
Dimsum x1

----------------

Subtotal
Rp75.000

Tax
Rp8.250

Service
Rp3.750

TOTAL
Rp87.000

[Process Payment]
```

---



# 10. Payment Interface



### Requirements

Payment modal/page harus memiliki:

Payment methods:

- Cash.
- QRIS.
- Debit Card.
- Credit Card.
- E-Wallet.



## Cash Flow

```text
Amount Due
Rp87.000

Amount Received
Rp100.000

Change
Rp13.000
```

CTA:

```text
Complete Payment
```

Setelah pembayaran:

```text
Payment Successful

PAY-001

Table A01
Rp87.000

[Done]
```

---



# 11. Table Management



### Route

```text
/admin/tables
```

Tampilkan visual floor/table layout.

Example:

```text
┌──────┐  ┌──────┐  ┌──────┐
│ A01  │  │ A02  │  │ A03  │
│ FREE │  │ BUSY │  │ FREE │
└──────┘  └──────┘  └──────┘

┌──────────┐
│ A04      │
│ PAYMENT  │
└──────────┘
```



## Requirements

Admin dapat:

- Melihat meja.
- Menambahkan meja.
- Mengubah meja.
- Menghapus meja.
- Melihat status meja.
- Membuka QR.
- Generate QR.
- Download QR.
- Print QR.

---



# 12. QR Management



### Route

```text
/admin/tables/qr
```

Setiap meja memiliki QR preview.

Example:

```text
TABLE A01

[ QR CODE ]

Scan to order

[Download]
[Print]
```

Gunakan dummy QR code pada fase frontend.

---



# 13. Menu Management



### Route

```text
/admin/menu
```



## Requirements

Tampilkan:

- Product image.
- Product name.
- Category.
- Price.
- Availability.
- Popular status.
- Actions.

Actions:

```text
Edit
Delete
Toggle Availability
```

CTA:

```text
Add Product
```

---



# 14. Product Editor



### Route

```text
/admin/menu/new
/admin/menu/[id]/edit
```

Fields:

- Product name.
- Description.
- Category.
- Price.
- Image.
- Availability.
- Popular.
- Variants.
- Modifier groups.

Admin dapat menambahkan modifier.

Example:

```text
Spicy Level

○ Level 0
○ Level 1
○ Level 2
○ Level 3
○ Level 4
```

---



# 15. Category Management



### Route

```text
/admin/categories
```

Requirements:

- View categories.
- Add category.
- Edit category.
- Delete category.
- Reorder category.
- Toggle active/inactive.

Example:

```text
Mie
Dimsum
Minuman
Snack
Paket
```

---



# 16. Inventory Dashboard



### Route

```text
/admin/inventory
```



## KPI

- Total Ingredients.
- Low Stock.
- Out of Stock.
- Inventory Value.



## Inventory Table

Columns:

```text
Ingredient
SKU
Current Stock
Minimum Stock
Unit
Status
Actions
```

Statuses:

```text
IN_STOCK
LOW_STOCK
OUT_OF_STOCK
```

Low stock harus memiliki visual warning.

---



# 17. Supplier Management



### Route

```text
/admin/suppliers
```

Tampilkan:

- Supplier name.
- Contact.
- Email.
- Phone.
- Address.
- Status.

Actions:

- Add supplier.
- Edit supplier.
- Delete supplier.
- View purchase history.

---



# 18. Order Management



### Route

```text
/admin/orders
```



## Filters

- Today.
- Yesterday.
- This week.
- This month.
- Custom date.



## Status

```text
Pending
Confirmed
Preparing
Ready
Completed
Cancelled
```



## Table

Columns:

```text
Order
Table
Items
Amount
Status
Created
Actions
```

Klik order untuk membuka detail.

---



# 19. Payment Management



### Route

```text
/admin/payments
```

Tampilkan:

- Payment number.
- Order/session.
- Table.
- Amount.
- Payment method.
- Status.
- Cashier.
- Date/time.

Filter:

- Payment method.
- Status.
- Date.

---



# 20. Sales Dashboard



### Route

```text
/admin/dashboard
```

Dashboard harus menjadi halaman utama admin.

## KPI Cards

- Today's Revenue.
- Today's Orders.
- Average Order Value.
- Active Tables.



## Charts



### Revenue

Line/area chart:

```text
Revenue over time
```



### Orders

Bar chart:

```text
Orders over time
```



### Best Sellers

Bar chart/list:

```text
1. Mie Pedas Lv 2
2. Dimsum
3. Es Teh
```



### Sales by Category

Chart:

```text
Mie
Minuman
Dimsum
Snack
```



### Payment Methods

Chart:

```text
Cash
QRIS
Debit
E-Wallet
```



## Recent Orders

Table:

```text
Order
Table
Items
Amount
Status
Time
```

---



# 21. Staff Management



### Route

```text
/admin/staff
```

Fields:

- Staff name.
- Role.
- Branch.
- Status.
- Last active.

Roles:

```text
ADMIN
MANAGER
CASHIER
KITCHEN
WAITER
```

Actions:

- Add staff.
- Edit staff.
- Disable staff.

---



# 22. Shift Management



### Route

```text
/admin/shifts
```

Tampilkan:

- Current shift.
- Cashier.
- Opening cash.
- Closing cash.
- Start time.
- End time.
- Status.

Actions:

```text
Open Shift
Close Shift
```

---



# 23. Admin Navigation

Gunakan sidebar desktop:

```text
Restaurant

Dashboard

Orders
Kitchen
Cashier
Tables

Menu
Categories

Inventory
Suppliers

Sales
Payments

Staff
Shifts

Settings
```

Tambahkan:

- Restaurant/branch selector.
- Current user.
- Notification button.
- Theme toggle.
- Collapse sidebar.

---



# 24. Responsive Requirements



## Customer

Customer interface harus:

- Mobile-first.
- Mudah digunakan dengan satu tangan.
- Bottom cart CTA.
- Touch-friendly controls.
- Tidak memiliki horizontal overflow.
- Image menu optimal untuk mobile.



## Staff

Staff interface harus:

- Desktop-first.
- Optimal pada laptop/desktop.
- Tetap usable pada tablet.
- Sidebar responsive.
- Data table dapat berubah menjadi card pada layar kecil.

---



# 25. Design System



## Design Principles

- Modern.
- Clean.
- Premium.
- Professional.
- Minimal.
- High readability.
- Consistent spacing.
- Clear hierarchy.
- Fast visual scanning.



## UI Library

Gunakan:

- Tailwind CSS.
- shadcn/ui.
- Lucide Icons.



## Components

Gunakan reusable:

- Button.
- Card.
- Badge.
- Dialog.
- Drawer.
- Tabs.
- Table.
- Dropdown.
- Select.
- Input.
- Toast.
- Tooltip.
- Skeleton.
- Alert.
- Empty State.
- Pagination.

---



# 26. Color and Status System

Status harus mudah dibedakan.

Gunakan semantic colors dari design system:

```text
AVAILABLE
OCCUPIED
WAITING_PAYMENT
READY
SUCCESS
WARNING
ERROR
```

Jangan mengandalkan warna saja.

Tambahkan:

- Icon.
- Label.
- Shape/badge.

---



# 27. Mock Data Requirements

Gunakan mock data lokal.

Minimum:

```text
Restaurants: 1
Branches: 2
Tables: 10
Categories: 5
Products: 20
Modifiers: 10+
Orders: 20
Kitchen Orders: 15
Payments: 15
Ingredients: 10
Suppliers: 5
Staff: 8
```

Mock data harus konsisten.

Contoh:

Jika:

```text
Table A01 = OCCUPIED
```

maka harus memiliki active table session.

Jika session aktif memiliki order:

```text
Order #1001
```

order tersebut harus muncul pada cashier dan order management.

Jika order memiliki status:

```text
PREPARING
```

maka harus muncul di Kitchen sebagai preparing.

---



# 28. Frontend State Simulation

Walaupun belum menggunakan backend, frontend harus terasa interaktif.

## Customer

```text
Add Product
    ↓
Cart Updated
    ↓
Place Order
    ↓
Create Mock Order
    ↓
Success Page
    ↓
Tracking Page
```



## Kitchen

```text
NEW
 ↓
ACCEPT
 ↓
PREPARING
 ↓
READY
```



## Cashier

```text
Select Table
 ↓
View Orders
 ↓
Process Payment
 ↓
Payment Success
```



## Table

```text
AVAILABLE
 ↓
OCCUPIED
 ↓
WAITING PAYMENT
 ↓
AVAILABLE
```

Gunakan React state/context atau state management sederhana jika diperlukan.

---



# 29. Route Structure

Gunakan struktur:

```text
/
├── order/
│   ├── table/
│   │   └── [token]/
│   ├── cart/
│   ├── success/
│   └── [orderId]/
│
├── staff/
│   ├── kitchen/
│   ├── cashier/
│   └── orders/
│
└── admin/
    ├── dashboard/
    ├── tables/
    ├── tables/qr/
    ├── menu/
    ├── menu/new/
    ├── menu/[id]/edit/
    ├── categories/
    ├── inventory/
    ├── suppliers/
    ├── orders/
    ├── payments/
    ├── staff/
    ├── shifts/
    └── settings/
```

---



# 30. Component Architecture

Recommended structure:

```text
components/
├── customer/
│   ├── restaurant-header
│   ├── table-badge
│   ├── category-tabs
│   ├── product-card
│   ├── product-detail
│   ├── modifier-selector
│   ├── quantity-selector
│   ├── cart-bar
│   ├── cart-item
│   └── order-status
│
├── kitchen/
│   ├── kitchen-board
│   ├── kitchen-column
│   ├── kitchen-order-card
│   ├── kitchen-stats
│   └── order-timer
│
├── cashier/
│   ├── table-grid
│   ├── table-card
│   ├── bill-summary
│   ├── payment-dialog
│   └── payment-method-selector
│
├── admin/
│   ├── sidebar
│   ├── header
│   ├── stat-card
│   ├── data-table
│   ├── filters
│   └── charts
│
└── ui/
    └── shadcn-components
```

---



# 31. TypeScript Domain Types

Buat type/interface untuk domain utama:

```text
Restaurant
Branch
DiningTable
TableSession
Category
Product
ProductVariant
ModifierGroup
Modifier
Order
OrderItem
KitchenOrder
Payment
PaymentMethod
Ingredient
Supplier
Staff
Shift
```

Gunakan type tersebut untuk mock data agar struktur frontend konsisten.

---



# 32. Accessibility

UI harus memperhatikan:

- Keyboard navigation.
- Focus state.
- Semantic HTML.
- Accessible labels.
- Sufficient contrast.
- Dialog accessibility.
- Form validation message.
- Button states.

Customer harus tetap dapat memahami status order walaupun tidak membedakan warna.

---



# 33. Loading States

Setiap halaman atau interaksi yang membutuhkan loading harus memiliki skeleton/loading state.

Contoh:

```text
Product Skeleton
Order Skeleton
Table Skeleton
Dashboard Skeleton
Kitchen Skeleton
```

Gunakan fake delay jika diperlukan untuk demo.

---



# 34. Empty States

Buat empty state untuk kondisi:

- Cart empty.
- No orders.
- No kitchen orders.
- No products.
- No inventory warning.
- No payments.
- No staff.
- No search results.

Contoh:

```text
No orders found.

Try changing your filter.
```

---



# 35. Error States

Buat UI error sederhana untuk:

- Failed to load data.
- Failed to add item.
- Invalid table.
- Invalid order.
- Payment failure simulation.

Contoh:

```text
Something went wrong.

Please try again.

[Retry]
```

---



# 36. Notifications

Gunakan toast notification untuk:

- Product added.
- Product removed.
- Order created.
- Order status changed.
- Payment completed.
- Table updated.
- Product availability changed.

---



# 37. Demo Scenarios

Prototype harus dapat mendemonstrasikan skenario berikut.

## Scenario A — Customer Order

```text
Open Table A01
    ↓
Browse Mie
    ↓
Select Mie Pedas Lv 2
    ↓
Select Level 2
    ↓
Add Dimsum
    ↓
Open Cart
    ↓
Place Order
    ↓
Order #ORD-001 created
    ↓
Track Order
```



## Scenario B — Kitchen

```text
Open Kitchen Dashboard
    ↓
New Order appears
    ↓
Accept
    ↓
Preparing
    ↓
Ready
```



## Scenario C — Cashier

```text
Open Cashier
    ↓
Select Table A01
    ↓
View all active orders
    ↓
Process payment
    ↓
Select QRIS
    ↓
Payment successful
```



## Scenario D — Admin

```text
Open Dashboard
    ↓
View revenue
    ↓
View orders
    ↓
View active tables
    ↓
Open menu
    ↓
Edit product
    ↓
Open inventory
```

---



# 38. Acceptance Criteria



## Customer

- [ ] Customer dapat membuka ordering page berdasarkan table token.
- [ ] Customer dapat melihat menu.
- [ ] Customer dapat mencari produk.
- [ ] Customer dapat memfilter kategori.
- [ ] Customer dapat membuka detail produk.
- [ ] Customer dapat memilih modifier.
- [ ] Customer dapat mengubah quantity.
- [ ] Customer dapat melihat cart.
- [ ] Customer dapat membuat mock order.
- [ ] Customer dapat melihat order confirmation.
- [ ] Customer dapat melihat status order.
- [ ] Customer dapat request bill.



## Kitchen

- [ ] Kitchen dapat melihat order baru.
- [ ] Kitchen dapat melihat nomor meja.
- [ ] Kitchen dapat melihat item.
- [ ] Kitchen dapat melihat modifier.
- [ ] Kitchen dapat mengubah status.
- [ ] Kitchen dapat melihat timer.
- [ ] Kitchen dapat melakukan filtering.



## Cashier

- [ ] Cashier dapat melihat meja.
- [ ] Cashier dapat melihat status meja.
- [ ] Cashier dapat memilih meja.
- [ ] Cashier dapat melihat active orders.
- [ ] Cashier dapat melihat total bill.
- [ ] Cashier dapat memilih payment method.
- [ ] Cashier dapat menyelesaikan mock payment.



## Admin

- [ ] Admin dapat melihat dashboard.
- [ ] Admin dapat melihat order.
- [ ] Admin dapat mengelola meja.
- [ ] Admin dapat melihat/generate QR.
- [ ] Admin dapat mengelola menu.
- [ ] Admin dapat mengelola kategori.
- [ ] Admin dapat melihat inventory.
- [ ] Admin dapat melihat supplier.
- [ ] Admin dapat melihat payment.
- [ ] Admin dapat mengelola staff.
- [ ] Admin dapat mengelola shift.

---



# 39. Future Backend Scope

Fase frontend ini nantinya akan dihubungkan dengan backend.

Arsitektur target:

```text
Next.js
    ↓
API / Server Actions
    ↓
PostgreSQL
    ↓
Prisma ORM
```

Future realtime:

```text
Customer
    ↓
Create Order
    ↓
Backend
    ↓
Realtime Event
    ↓
Kitchen Display
```

Future authentication:

```text
Customer
Staff
Admin
Manager
Cashier
Kitchen
```

Future payment:

```text
Cash
QRIS
E-Wallet
Card
Payment Gateway
```

---



# 40. Future Database Scope

Database yang akan digunakan pada fase backend:

### Organization

```text
restaurants
branches
```



### Table

```text
dining_tables
table_sessions
```



### Menu

```text
categories
products
product_variants
modifier_groups
modifiers
```



### Order

```text
orders
order_items
order_item_modifiers
```



### Kitchen

```text
kitchen_orders
kitchen_order_items
```



### Payment

```text
payment_methods
payments
discounts
order_discounts
```



### Inventory

```text
ingredients
recipes
stock_movements
suppliers
purchase_orders
purchase_order_items
```



### Staff

```text
users
roles
permissions
role_permissions
shifts
```



### Finance/System

```text
taxes
service_charges
expenses
audit_logs
```

---



# 41. Development Phases



## Phase 1 — Design System

- Setup Next.js.
- Setup Tailwind.
- Setup shadcn/ui.
- Setup typography.
- Setup layout.
- Setup responsive behavior.
- Setup reusable components.



## Phase 2 — Customer

- QR/table page.
- Menu.
- Product detail.
- Cart.
- Order confirmation.
- Order tracking.
- Request bill.



## Phase 3 — Kitchen

- KDS.
- Order cards.
- Status workflow.
- Timer.
- Filters.



## Phase 4 — Cashier

- Table grid.
- Active sessions.
- Bill.
- Payment UI.
- Payment success.



## Phase 5 — Admin

- Dashboard.
- Tables.
- QR management.
- Menu.
- Categories.
- Inventory.
- Suppliers.
- Orders.
- Payments.
- Staff.
- Shifts.



## Phase 6 — Polish

- Loading states.
- Empty states.
- Error states.
- Toasts.
- Responsive testing.
- Accessibility.
- UX refinement.



## Phase 7 — Backend

Future phase:

- PostgreSQL.
- Prisma.
- API.
- Authentication.
- Authorization.
- Persistent orders.
- Inventory.
- Payment integration.
- Realtime.

---



# 42. Definition of Done — Frontend Prototype

Frontend prototype dianggap selesai apabila:

1. Semua route utama dapat dibuka.
2. Customer flow dapat dilakukan dari scan QR sampai request bill.
3. Kitchen flow dapat dilakukan dari new order sampai ready.
4. Cashier flow dapat dilakukan dari table selection sampai payment success.
5. Admin dashboard dapat digunakan untuk melihat dan mengelola mock data.
6. Semua halaman responsive.
7. Tidak ada horizontal overflow.
8. Components reusable.
9. Mock data konsisten antar halaman.
10. Loading, empty, error, dan success states tersedia.
11. UI terlihat seperti aplikasi restoran production-grade.
12. Tidak ada dependency terhadap backend/database.

---



# 43. Final Product Vision

Produk akhir yang ingin dicapai:

```text
                    CUSTOMER
                       │
                   Scan QR
                       │
                       ▼
                     MENU
                       │
                       ▼
                     CART
                       │
                       ▼
                    ORDER
                       │
                       ▼
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
           KITCHEN           CASHIER
              │                 │
         Preparing          View Bill
              │                 │
            Ready            Payment
              │                 │
              └────────┬────────┘
                       ▼
                  COMPLETED
                       │
                       ▼
                 TABLE AVAILABLE
```

Sedangkan admin memonitor seluruh sistem:

```text
ADMIN
 │
 ├── Dashboard
 ├── Orders
 ├── Tables
 ├── Menu
 ├── Inventory
 ├── Payments
 ├── Staff
 ├── Shifts
 └── Reports
```

Tujuan utama prototype adalah memberikan pengalaman yang terasa seperti **restaurant operating system**, bukan sekadar website menu restoran.