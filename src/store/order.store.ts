import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MockOrderItem } from "@/lib/mock-data";
import { db } from "@/lib/firebase/config";
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";

export type OrderStatus = "PENDING" | "PREPARING" | "ON_THE_WAY" | "DELIVERED" | "COMPLETED" | "PAID" | "CANCELLED";
export type ServiceRequestType = "WAITER" | "BILL";
export type OrderSource = "DINE_IN" | "YEMEKSEPETI" | "GETIR" | "TRENDYOL" | "MIGROS";

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
  source?: OrderSource;
  courierName?: string;
  customerInfo?: { name: string; address: string; phone: string };
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
  ) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus, waiterName?: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;

  // Garson: Sipariş düzenleme
  updateOrderItems: (orderId: string, items: MockOrderItem[], newTotal: number) => Promise<void>;
  // Garson + Admin: Masa değiştirme
  changeOrderTable: (orderId: string, newTableNumber: number) => Promise<void>;
  // Paket Servis
  assignCourier: (orderId: string, courierName: string) => Promise<void>;
  simulateExternalOrder: (source: OrderSource) => Promise<string>;

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
          source: "DINE_IN" as OrderSource,
        };

        try {
          await setDoc(doc(db, "orders", orderId), newOrder);
          // onSnapshot listener will automatically receive this new order immediately
          return orderId;
        } catch (error) {
          console.error("Error placing order:", error);
          throw error;
        }
      },

      simulateExternalOrder: async (source) => {
        const orderId = `ext_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        const SAMPLE_ITEMS = [
          { name: "Izgara Köfte Menu", price: 250 },
          { name: "Tavuk Şiş Menu", price: 220 },
          { name: "Karışık Pizza Büyük", price: 300 },
          { name: "Limonata", price: 50 },
          { name: "Künefe", price: 150 }
        ];
        
        const count = Math.floor(Math.random() * 3) + 1;
        const items = Array.from({ length: count }, () => {
          const sample = SAMPLE_ITEMS[Math.floor(Math.random() * SAMPLE_ITEMS.length)];
          return {
            productId: `prod_${Math.random()}`,
            name: sample.name,
            quantity: Math.floor(Math.random() * 2) + 1,
            unitPrice: sample.price,
          };
        });
        
        const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

        const newOrder = {
          id: orderId,
          tableNumber: 0, // 0 means package
          status: "PENDING" as OrderStatus,
          totalAmount,
          createdAt: serverTimestamp(),
          items,
          notes: "Temassız teslimat.",
          restaurantId: "rest_demo_001",
          source,
          customerInfo: {
            name: "Müşteri " + Math.floor(Math.random() * 100),
            address: "Örnek Mah. Test Sok. No: 12",
            phone: "0555 555 5555"
          }
        };

        try {
          await setDoc(doc(db, "orders", orderId), newOrder);
          return orderId;
        } catch (error) {
          console.error("Error placing external order:", error);
          throw error;
        }
      },

      updateOrderStatus: async (orderId, status, waiterName) => {
        try {
          const updateData: Record<string, unknown> = { status };
          if (status === "COMPLETED" || status === "DELIVERED") {
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
                    ...((status === "COMPLETED" || status === "DELIVERED") ? { completedAt: new Date() } : {}),
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

      assignCourier: async (orderId, courierName) => {
        try {
          await updateDoc(doc(db, "orders", orderId), { 
            courierName, 
            status: "ON_THE_WAY" 
          });
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...o, courierName, status: "ON_THE_WAY" } : o
            ),
          }));
        } catch (error) {
          console.error("Error assigning courier:", error);
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
          // onSnapshot handles local update
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
