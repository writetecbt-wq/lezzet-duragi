import { create } from "zustand";

import { MockOrderItem, MOCK_PRODUCTS } from "@/lib/mock-data";
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

type OrderStore = {
  orders: FirestoreOrder[];
  serviceRequests: ServiceRequest[];
  
  placeOrder: (
    tableNumber: number,
    items: MockOrderItem[],
    totalAmount: number,
    notes?: string,
    waiterName?: string
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

  // Müşteri (Alman Usulü) Kısmi Ödeme
  payForTableItems: (tableNumber: number, paidItems: { productId: string; quantity: number; unitPrice: number; name: string }[]) => Promise<void>;

  // KDS İstasyon Bazlı Öğeyi Hazır İşaretleme
  toggleOrderItemStatus: (orderId: string, itemId: string) => Promise<void>;

  // Admin Realtime Listeners
  listenToOrders: () => () => void; // returns unsubscribe function
  listenToServiceRequests: () => () => void;
  
  // Müşteri Yorum (Review)
  submitReview: (orderId: string, tableNumber: number, rating: number, comment?: string) => Promise<void>;
};

export const useOrderStore = create<OrderStore>((set, get) => ({
      orders: [],
      serviceRequests: [],

      placeOrder: async (tableNumber, items, totalAmount, notes, waiterName) => {
        const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        const enrichedItems = items.map((item, index) => {
          const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
          return {
            ...item,
            id: `${orderId}_item_${index}`,
            status: item.status || "PENDING",
            categoryId: product?.categoryId || item.categoryId
          };
        });

        const newOrder = {
          id: orderId,
          tableNumber,
          status: "PENDING" as OrderStatus,
          totalAmount,
          createdAt: serverTimestamp(),
          items: enrichedItems,
          notes: notes || "",
          waiterName: waiterName || "",
          restaurantId: "rest_demo_001", // hardcoded for now
          source: "DINE_IN" as OrderSource,
        };

        // Recursively remove any undefined properties to prevent Firebase Error
        const cleanUndefined = (obj: any): any => {
          if (Array.isArray(obj)) return obj.map(cleanUndefined);
          if (obj !== null && typeof obj === 'object') {
            return Object.fromEntries(
              Object.entries(obj)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => [k, cleanUndefined(v)])
            );
          }
          return obj;
        };

        const cleanOrder = cleanUndefined(newOrder);
        cleanOrder.createdAt = serverTimestamp();

        try {
          await Promise.race([
            setDoc(doc(db, "orders", orderId), cleanOrder),
            new Promise<void>((_, reject) => setTimeout(() => reject(new Error("Timeout placing order")), 5000))
          ]);
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
        const items = Array.from({ length: count }, (_, idx) => {
          const sample = SAMPLE_ITEMS[Math.floor(Math.random() * SAMPLE_ITEMS.length)];
          return {
            id: `${orderId}_item_${idx}`,
            productId: `prod_${Math.random()}`,
            name: sample.name,
            quantity: Math.floor(Math.random() * 2) + 1,
            unitPrice: sample.price,
            status: "PENDING",
            categoryId: "cat_yiyecek_001" // dummy category for mock
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

      toggleOrderItemStatus: async (orderId, itemId) => {
        const state = get();
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        // itemId may be undefined or non-unique; also support index-based toggle
        // We look up by id first, fallback to nothing (handled by caller using index)
        const newItems = order.items.map((item, idx) => {
          const matchById = item.id && item.id === itemId;
          // itemId may encode the index as "__idx__N" for robustness
          const matchByIdx = itemId?.startsWith("__idx__") && parseInt(itemId.replace("__idx__", "")) === idx;
          if (matchById || matchByIdx) {
            return { ...item, status: item.status === "COMPLETED" ? "PENDING" as const : "COMPLETED" as const };
          }
          return item;
        });

        const allCompleted = newItems.every(i => i.status === "COMPLETED");
        const newStatus = allCompleted ? "COMPLETED" : "PREPARING";

        try {
          const updateData: Record<string, unknown> = { items: newItems, status: newStatus };
          if (allCompleted) {
            updateData.completedAt = serverTimestamp();
          }

          await updateDoc(doc(db, "orders", orderId), updateData);
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? { ...o, items: newItems, status: newStatus as OrderStatus, ...(allCompleted ? { completedAt: new Date() } : {}) } : o
            ),
          }));
        } catch (error) {
          console.error("Error toggling item status:", error);
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

      payForTableItems: async (tableNumber, paidItems) => {
        const state = get();
        const activeOrders = state.orders.filter(
          (o) => o.tableNumber === tableNumber && o.status !== "PAID" && o.status !== "CANCELLED"
        );
        
        if (activeOrders.length === 0 || paidItems.length === 0) return;

        let totalPaidAmount = 0;
        const paidItemsToStore: MockOrderItem[] = [];
        const remainingItemsMap = new Map(paidItems.map(p => [p.productId, p.quantity]));

        // Subtract paid items from active orders
        for (const order of activeOrders) {
          let orderChanged = false;
          let newTotal = 0;
          const newItems: MockOrderItem[] = [];

          for (const item of order.items) {
            const qtyToPay = remainingItemsMap.get(item.productId) || 0;
            if (qtyToPay > 0) {
              const deduction = Math.min(item.quantity, qtyToPay);
              remainingItemsMap.set(item.productId, qtyToPay - deduction);
              
              paidItemsToStore.push({
                ...item,
                quantity: deduction,
                id: `paid_${Date.now()}_${Math.random()}`
              });
              totalPaidAmount += deduction * item.unitPrice;

              if (item.quantity > deduction) {
                newItems.push({ ...item, quantity: item.quantity - deduction });
                newTotal += (item.quantity - deduction) * item.unitPrice;
              }
              orderChanged = true;
            } else {
              newItems.push(item);
              newTotal += item.quantity * item.unitPrice;
            }
          }

          if (orderChanged) {
            try {
              if (newItems.length === 0) {
                await updateDoc(doc(db, "orders", order.id), { status: "PAID", completedAt: serverTimestamp(), items: [], totalAmount: 0 });
              } else {
                await updateDoc(doc(db, "orders", order.id), { items: newItems, totalAmount: newTotal });
              }
            } catch (error) {
              console.error("Error updating partially paid order:", error);
            }
          }
        }

        // Create a new PAID order for the paid items to keep history clean
        if (paidItemsToStore.length > 0) {
          const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          const newOrder: Record<string, unknown> = {
            id: orderId,
            tableNumber,
            status: "PAID" as OrderStatus,
            totalAmount: totalPaidAmount,
            createdAt: serverTimestamp(),
            completedAt: serverTimestamp(),
            items: paidItemsToStore,
            notes: "QR Menü Kısmi Ödeme",
            restaurantId: "rest_demo_001",
            source: "DINE_IN" as OrderSource,
          };
          try {
            await setDoc(doc(db, "orders", orderId), newOrder);
          } catch (error) {
            console.error("Error saving paid items as new order:", error);
          }
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
        const q = query(collection(db, "orders"));
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
          
          orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          set({ orders });
        });
        return unsubscribe;
      },

      listenToServiceRequests: () => {
        const q = query(collection(db, "service_requests"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const requests = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
            } as ServiceRequest;
          });
          
          requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          set({ serviceRequests: requests });
        });
        return unsubscribe;
      },
    }));
