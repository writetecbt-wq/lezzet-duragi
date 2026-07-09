import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { MOCK_RESTAURANT, MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";

export async function GET() {
  try {
    // 1. Migrate Restaurant
    const restRef = doc(db, "restaurants", MOCK_RESTAURANT.id);
    await setDoc(restRef, MOCK_RESTAURANT);

    // 2. Migrate Tables (Let's create 10 tables for the demo restaurant)
    for (let i = 1; i <= 10; i++) {
      const tableId = `table_${i}`;
      await setDoc(doc(db, "tables", tableId), {
        id: tableId,
        number: i,
        qrCodeUrl: `http://localhost:3000/${MOCK_RESTAURANT.id}/menu/${i}`,
        restaurantId: MOCK_RESTAURANT.id,
      });
    }

    // 3. Migrate Categories
    for (const cat of MOCK_CATEGORIES) {
      await setDoc(doc(db, "categories", cat.id), {
        ...cat,
        restaurantId: MOCK_RESTAURANT.id,
      });
    }

    // 4. Migrate Products
    for (const prod of MOCK_PRODUCTS) {
      await setDoc(doc(db, "products", prod.id), {
        ...prod,
        restaurantId: MOCK_RESTAURANT.id,
      });
    }

    return NextResponse.json({ message: "Migration completed successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
