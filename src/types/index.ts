import { OrderStatus, Prisma } from "@prisma/client";

// ─── Domain Types ──────────────────────────────────────

export type ProductWithCategory = {
  id: string;
  name: string;
  description: string | null;
  price: Prisma.Decimal;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
};

export type CategoryWithProducts = {
  id: string;
  name: string;
  imageUrl: string | null;
  sortOrder: number;
  products: ProductWithCategory[];
};

export type OrderWithItems = {
  id: string;
  tableId: string;
  totalAmount: Prisma.Decimal;
  status: OrderStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  table: {
    tableNumber: number;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    product: {
      id: string;
      name: string;
    };
  }>;
};

// ─── Cart Types (Client-only) ──────────────────────────

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
};

// ─── API Response Types ────────────────────────────────

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

// ─── Pusher Event Payloads ─────────────────────────────

export type NewOrderPayload = {
  orderId: string;
  tableNumber: number;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
};

export type OrderUpdatedPayload = {
  orderId: string;
  status: OrderStatus;
};
