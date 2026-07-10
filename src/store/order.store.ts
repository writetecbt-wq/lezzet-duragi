import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MockOrderItem } from "@/lib/mock-data";
import { db } from "@/lib/firebase/config";
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";

export type OrderStatus = "PENDING" | "PREPARING" | "COMPLETED" | "PAID" | "CANCELLED";
export type ServiceRequestType = "WAITER" | "BILL";

export type FirestoreOrder = {
  id: string;
  tableNumber: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  completedAt?: Date;
  items: MockOrderItem[];
  notes?: string;
  waiterName?: string;
  restaurantId?: string;
};

export type ServiceRequest = {
  id: string;
  tableNumber: number;
  type: ServiceRequestType;
  status: "PENDING" | "RESOLVED";
  createdAt: Date;
  restaurantId?: string;
};

const safeStorage = {
  getItem: (name: string) => {
    try { return localStorage.getItem(name); } catch { return null; }
  },
  setItem: (name: string, value: string) => {
    try { localStorage.setItem(name, value); } catch {}
  },
  removeItem: (name: string) => {
    try { localStorage.removeItem(name); } catch {}
  },
};

type OrderStore = {
  orders: FirestoreOrder[];
  serviceRequests: ServiceRequest[];
  
  placeOrder: (
    tableNumber: number,
    items: MockOrderItem[],
    totalAmount: number,
    notes?: string
  ) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, waiterName?: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;

  // Garson: Sipariş düzenleme
  updateOrderItems: (orderId: string, items: MockOrderItem[], newTotal: number) => Promise<void>;
  // Garson + Admin: Masa değiştirme
  changeOrderTable: (orderId: string, newTableNumber: number) => Promise<void>;

  requestService: (tableNumber: number, type: ServiceRequestType) => Promise<void>;
  resolveServiceRequest: (id: string) => Promise<void>;

  // Admin Realtime Listeners
  listenToOrders: () => () => void; // returns unsubscribe function
  listenToServiceRequests: () => () => void;
  
  // Müşteri Yorum (Review)
  submitReview: (orderId: string, tableNumber: number, rating: number, comment?: string) => Promise<void>;
};

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      serviceRequests: [],

      placeOrder: async (tableNumber, items, totalAmount, notes) => {
        const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const newOrder = {
          id: orderId,
          tableNumber,
          status: "PENDING" as OrderStatus,
          totalAmount,
          createdAt: serverTimestamp(),
          items,
          notes: notes || "",
          restaurantId: "rest_demo_001", // hardcoded for now
        };

        try {
          await setDoc(doc(db, "orders", orderId), newOrder);
          // Also update local state for the client
          set((state) => ({ 
            orders: [{...newOrder, createdAt: new Date()} as FirestoreOrder, ...state.orders] 
          }));
        } catch (error) {
          console.error("Error placing order:", error);
        }
      },

      updateOrderStatus: async (orderId, status, waiterName) => {
        try {
          const updateData: Record<string, unknown> = { status };
          if (status === "COMPLETED") {
            updateData.completedAt = serverTimestamp();
          }
          if (waiterName) {
            updateData.waiterName = waiterName;
          }
          await updateDoc(doc(db, "orders", orderId), updateData);
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId
                ? { 
                    ...o, 
                    status, 
                    ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
                    ...(waiterName ? { waiterName } : {})
                  }
                : o
            ),
          }));
        } catch (error) {
          console.error("Error updating order:", error);
        }
      },

      cancelOrder: async (orderId) => {
        try {
          await updateDoc(doc(db, "orders", orderId), { status: "CANCELLED" });
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...o, status: "CANCELLED" } : o
            ),
          }));
        } catch (error) {
          console.error("Error cancelling order:", error);
        }
      },

      updateOrderItems: async (orderId, items, newTotal) => {
        try {
          await updateDoc(doc(db, "orders", orderId), { items, totalAmount: newTotal });
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...o, items, totalAmount: newTotal } : o
            ),
          }));
        } catch (error) {
          console.error("Error updating order items:", error);
        }
      },

      changeOrderTable: async (orderId, newTableNumber) => {
        try {
          await updateDoc(doc(db, "orders", orderId), { tableNumber: newTableNumber });
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...o, tableNumber: newTableNumber } : o
            ),
          }));
        } catch (error) {
          console.error("Error changing order table:", error);
        }
      },

      requestService: async (tableNumber, type) => {
        const state = get();
        const exists = state.serviceRequests.some(
          (r) => r.tableNumber === tableNumber && r.type === type && r.status === "PENDING"
        );
        if (exists) return; // Prevent spam

        const reqId = `req_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const newReq = {
          id: reqId,
          tableNumber,
          type,
          status: "PENDING" as const,
          createdAt: serverTimestamp(),
          restaurantId: "rest_demo_001",
        };

        try {
          await setDoc(doc(db, "service_requests", reqId), newReq);
          set((state) => ({ 
            serviceRequests: [{...newReq, createdAt: new Date()} as ServiceRequest, ...(state.serviceRequests || [])] 
          }));
        } catch (error) {
          console.error("Error requesting service:", error);
        }
      },

      resolveServiceRequest: async (id) => {
        try {
          await updateDoc(doc(db, "service_requests", id), { status: "RESOLVED" });
          set((state) => ({
            serviceRequests: state.serviceRequests.map((r) =>
              r.id === id ? { ...r, status: "RESOLVED" } : r
            ),
          }));
        } catch (error) {
          console.error("Error resolving service request:", error);
        }
      },

      submitReview: async (orderId, tableNumber, rating, comment) => {
        const reviewId = `rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        try {
          await setDoc(doc(db, "reviews", reviewId), {
            id: reviewId,
            orderId,
            tableNumber,
            rating,
            comment: comment || "",
            createdAt: serverTimestamp(),
            restaurantId: "rest_demo_001",
          });
        } catch (error) {
          console.error("Error submitting review:", error);
        }
      },

      listenToOrders: () => {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const now = new Date();
          const orders = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
              completedAt: data.completedAt ? (data.completedAt as Timestamp).toDate() : undefined,
            } as FirestoreOrder;
          }).filter(o => (now.getTime() - o.createdAt.getTime()) < 12 * 60 * 60 * 1000); // Sadece son 12 saatin siparişlerini tut
          set({ orders });
        });
        return unsubscribe;
      },

      listenToServiceRequests: () => {
        const q = query(collection(db, "service_requests"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const requests = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
            } as ServiceRequest;
          });
          set({ serviceRequests: requests });
        });
        return unsubscribe;
      },
    }),
    {
      name: "restaurant-orders",
      storage: createJSONStorage(() => safeStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.orders = state.orders.map((o) => ({
            ...o,
            createdAt: new Date(o.createdAt),
            completedAt: o.completedAt ? new Date(o.completedAt) : undefined,
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
