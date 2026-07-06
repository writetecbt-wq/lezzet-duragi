import { z } from "zod";

// ─── Cart Item Schema ──────────────────────────────────
export const cartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive().max(20),
  unitPrice: z.number().positive(),
  name: z.string().min(1),
});

// ─── Create Order Schema ───────────────────────────────
export const createOrderSchema = z.object({
  tableId: z.string().cuid(),
  items: z
    .array(cartItemSchema)
    .min(1, "Sepet boş olamaz")
    .max(50, "Çok fazla ürün"),
  notes: z.string().max(500).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;

// ─── Update Order Status Schema ────────────────────────
export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "COMPLETED", "CANCELLED"]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
