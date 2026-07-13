import { NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { OrderSource, OrderStatus } from "@/store/order.store";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Expected Payload from n8n / Make.com
/*
{
  "restaurantId": "rest_demo_001",
  "source": "GETIR", // GETIR, YEMEKSEPETI, TRENDYOL, MIGROS
  "customerName": "Ali Yılmaz",
  "customerPhone": "+90 555 123 45 67",
  "customerAddress": "Örnek Mah. Test Sok. No:1 D:2",
  "courierName": "Ahmet K.",
  "items": [
    { "id": "prod_1", "name": "Izgara Köfte", "price": 450, "quantity": 2 }
  ],
  "totalAmount": 900,
  "notes": "Lütfen zili çalmayın."
}
*/

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic Validation
    if (!body.restaurantId || !body.source || !body.items) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { restaurantId, source, customerName, customerPhone, customerAddress, courierName, items, totalAmount, notes } = body;

    const newOrder = {
      tableNumber: 0, // 0 for delivery
      status: "PENDING" as OrderStatus,
      totalAmount: totalAmount || items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0),
      createdAt: serverTimestamp(),
      items: items,
      notes: notes || "",
      source: source as OrderSource,
      courierName: courierName || "Bilinmeyen Kurye",
      customerInfo: {
        name: customerName || "İsimsiz Müşteri",
        phone: customerPhone || "",
        address: customerAddress || ""
      }
    };

    const ordersRef = collection(db, "restaurants", restaurantId, "orders");
    const docRef = await addDoc(ordersRef, newOrder);

    return NextResponse.json({
      success: true,
      message: "Delivery order received successfully",
      orderId: docRef.id
    }, { status: 201 });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
