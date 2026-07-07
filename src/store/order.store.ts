"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MockOrder, MockOrderItem } from "@/lib/mock-data";

type OrderStatus = "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED";

export type ServiceRequestType = "WAITER" | "BILL";

export type ServiceRequest = {
  id: string;
  tableNumber: number;
  type: ServiceRequestType;
  status: "PENDING" | "RESOLVED";
  createdAt: Date;
};

type OrderStore = {
  orders: MockOrder[];
  serviceRequests: ServiceRequest[];
  
  placeOrder: (
    tableNumber: number,
    items: MockOrderItem[],
    totalAmount: number,
    notes?: string
  ) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;

  requestService: (tableNumber: number, type: ServiceRequestType) => void;
  resolveServiceRequest: (id: string) => void;
};

// Start with empty or mock orders
export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      serviceRequests: [],

      placeOrder: (tableNumber, items, totalAmount, notes) => {
        set((state) => {
          const newOrder: MockOrder = {
            id: `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            tableNumber,
            status: "PENDING",
            totalAmount,
            createdAt: new Date(),
            items,
            notes,
          };
          return { orders: [newOrder, ...state.orders] };
        });
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        }));
      },

      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: "CANCELLED" } : o
          ),
        }));
      },

      requestService: (tableNumber, type) => {
        set((state) => {
          const reqs = state.serviceRequests || [];
          // Check if there is an existing pending request for this table and type
          const exists = reqs.some(
            (r) => r.tableNumber === tableNumber && r.type === type && r.status === "PENDING"
          );
          if (exists) return state; // Ignore duplicate spam

          const newReq: ServiceRequest = {
            id: `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            tableNumber,
            type,
            status: "PENDING",
            createdAt: new Date(),
          };
          return { serviceRequests: [newReq, ...reqs] };
        });
      },


      resolveServiceRequest: (id) => {
        set((state) => ({
          serviceRequests: state.serviceRequests.map((r) =>
            r.id === id ? { ...r, status: "RESOLVED" } : r
          ),
        }));
      },
    }),
    {
      name: "restaurant-orders",
      // Since Dates don't serialize well natively, we map them upon rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.orders = state.orders.map((o) => ({
            ...o,
            createdAt: new Date(o.createdAt),
          }));
          state.serviceRequests = (state.serviceRequests || []).map((r) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          }));
        }
      },
    }
  )
);

// Cross-tab synchronization
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "restaurant-orders") {
      useOrderStore.persist.rehydrate();
    }
  });
}
