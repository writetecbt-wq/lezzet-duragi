import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { MOCK_RESTAURANT, MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    // Get the base URL from the request to build absolute image URLs
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    // 1. Migrate Restaurant
    const restRef = doc(db, "restaurants", MOCK_RESTAURANT.id);
    await setDoc(restRef, MOCK_RESTAURANT);

    // 2. Migrate Tables (11 tables for the demo restaurant)
    for (let i = 1; i <= 11; i++) {
      const tableId = `table_${i}`;
      await setDoc(doc(db, "tables", tableId), {
        id: tableId,
        number: i,
        qrCodeUrl: `${baseUrl}/${MOCK_RESTAURANT.id}/menu/${i}`,
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

    // 4. Migrate Products (convert relative image URLs to absolute)
    for (const prod of MOCK_PRODUCTS) {
      const imageUrl = prod.imageUrl?.startsWith("/")
        ? `${baseUrl}${prod.imageUrl}`
        : prod.imageUrl;

      await setDoc(doc(db, "products", prod.id), {
        ...prod,
        imageUrl,
        restaurantId: MOCK_RESTAURANT.id,
      });
    }

    return NextResponse.json({ 
      message: "Migration completed successfully!",
      products: MOCK_PRODUCTS.length,
      categories: MOCK_CATEGORIES.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
