"use client";

// Store global — simulasi state (PRD §28). Satu sumber kebenaran agar
// perubahan di satu halaman terlihat di halaman lain (PRD §27).

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  orders as seedOrders,
  payments as seedPayments,
  sessions as seedSessions,
  tables as seedTables,
} from "./mock-data";
import type {
  DiningTable,
  KitchenStatus,
  Order,
  OrderStatus,
  Payment,
  PaymentMethod,
  TableSession,
} from "./types";

export interface ToastMsg {
  id: number;
  title: string;
  description?: string;
  tone: "default" | "success" | "warning" | "error";
}

interface StoreState {
  tables: DiningTable[];
  sessions: TableSession[];
  orders: Order[];
  payments: Payment[];
  toasts: ToastMsg[];
  cart: Order["items"];
  lastOrderId: string | null;
  addToCart: (item: Order["items"][number]) => void;
  updateQty: (itemId: string, qty: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: (tableToken: string, tableCode: string) => string;
  advanceKitchen: (orderId: string) => void;
  payTable: (tableId: string, method: PaymentMethod) => void;
  openTable: (tableId: string) => void;
  toast: (t: Omit<ToastMsg, "id">) => void;
  dismissToast: (id: number) => void;
}

const StoreContext = createContext<StoreState | null>(null);

let seq = 100;
let orderSeq = 8;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [tables, setTables] = useState<DiningTable[]>(seedTables);
  const [sessions, setSessions] = useState<TableSession[]>(seedSessions);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [cart, setCart] = useState<Order["items"]>([]);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const toast = useCallback((t: Omit<ToastMsg, "id">) => {
    const id = ++seq;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addToCart = useCallback((it: Order["items"][number]) => {
    setCart((prev) => [...prev, it]);
  }, []);

  const updateQty = useCallback((itemId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((x) => x.id !== itemId)
        : prev.map((x) => (x.id === itemId ? { ...x, quantity: qty } : x))
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((x) => x.id !== itemId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const placeOrder = useCallback(
    (tableToken: string, tableCode: string) => {
      const id = `ord-${++orderSeq}`;
      const code = `ORD-20261006-${String(orderSeq).padStart(3, "0")}`;
      const newOrder: Order = {
        id,
        code,
        sessionToken: tableToken,
        tableCode,
        items: cart,
        createdAt: new Date().toISOString(),
        status: "PENDING",
        kitchenStatus: "NEW",
        note: "",
      };
      setOrders((prev) => [newOrder, ...prev]);
      const tableId = tables.find((t) => t.sessionToken === tableToken)?.id;
      setSessions((prev) =>
        prev.map((s) =>
          s.tableId === tableId
            ? { ...s, orderIds: [...s.orderIds, id] }
            : s
        )
      );
      setLastOrderId(id);
      setCart([]);
      return id;
    },
    [cart, tables]
  );

  const advanceKitchen = useCallback((orderId: string) => {
    const flow: KitchenStatus[] = ["NEW", "ACCEPTED", "PREPARING", "READY"];
    const orderFlow: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "READY"];
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const i = flow.indexOf(o.kitchenStatus);
        const next = flow[Math.min(i + 1, flow.length - 1)];
        return { ...o, kitchenStatus: next, status: orderFlow[Math.min(i + 1, 3)] };
      })
    );
  }, []);

  const payTable = useCallback(
    (tableId: string, method: PaymentMethod) => {
      const tbl = tables.find((t) => t.id === tableId);
      const tableOrders = orders.filter(
        (o) => tbl && o.tableCode === tbl.code && o.status !== "CANCELLED"
      );
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? { ...t, status: "AVAILABLE", sessionToken: "" }
            : t
        )
      );
      setSessions((prev) =>
        prev.map((s) => (s.tableId === tableId ? { ...s, billStatus: "PAID" } : s))
      );
      setOrders((prev) =>
        prev.map((o) => {
          if (tbl && o.tableCode === tbl.code) {
            return { ...o, status: "COMPLETED" };
          }
          return o;
        })
      );
      if (tbl) {
        const amount = tableOrders.reduce(
          (s, o) =>
            s +
            o.items.reduce(
              (x, i) => x + (i.unitPrice + i.modifierDelta) * i.quantity,
              0
            ),
          0
        );
        setPayments((prev) => [
          ...prev,
          {
            id: `pay-${prev.length + 1}`,
            code: `PAY-${String(prev.length + 1).padStart(3, "0")}`,
            orderId: tableOrders[0]?.id ?? "",
            tableCode: tbl.code,
            amount,
            method,
            paidAt: new Date().toISOString(),
          },
        ]);
      }
      const methodLabel: Record<PaymentMethod, string> = {
        QRIS: "QRIS",
        CASH: "Tunai",
      };
      toast({
        title: "Pembayaran berhasil",
        description: `${methodLabel[method]} — sesi meja ditutup dan meja kembali tersedia.`,
        tone: "success",
      });
    },
    [tables, orders, toast]
  );

  const openTable = useCallback((tableId: string) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId && t.status === "AVAILABLE"
          ? {
              ...t,
              status: "OCCUPIED",
              sessionToken: `sess_${t.code.toLowerCase()}_${Date.now()
                .toString()
                .slice(-4)}`,
            }
          : t
      )
    );
  }, []);

  const value = useMemo(
    () => ({
      tables,
      sessions,
      orders,
      payments,
      toasts,
      cart,
      lastOrderId,
      addToCart,
      updateQty,
      removeItem,
      clearCart,
      placeOrder,
      advanceKitchen,
      payTable,
      openTable,
      toast,
      dismissToast,
    }),
    [
      tables, sessions, orders, payments, toasts, cart, lastOrderId,
      addToCart, updateQty, removeItem, clearCart, placeOrder, advanceKitchen,
      payTable, openTable, toast, dismissToast,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore harus dipakai di dalam StoreProvider");
  return ctx;
}
