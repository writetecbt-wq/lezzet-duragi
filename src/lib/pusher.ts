import Pusher from "pusher";

// Server-side Pusher instance — used only in Route Handlers & Server Actions
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

// Channel and event name constants — single source of truth
export const PUSHER_CHANNELS = {
  ORDERS: "private-orders", // Private channel for admin
} as const;

export const PUSHER_EVENTS = {
  NEW_ORDER: "new-order",
  ORDER_UPDATED: "order-updated",
} as const;
