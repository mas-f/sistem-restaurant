export const USER_ROLES = ["admin", "kitchen", "cashier"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_PATH: Record<UserRole, string> = {
  admin: "/admin",
  kitchen: "/staff/kitchen",
  cashier: "/staff/cashier",
};

export const isUserRole = (value: string): value is UserRole => (USER_ROLES as readonly string[]).includes(value);
