import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const fallbackImages: Record<string, string> = {
  "Künefe": "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?q=80&w=800&auto=format&fit=crop", // placeholder sweet
  "Tiramisu": "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=800&auto=format&fit=crop", // tiramisu
};

async function main() {
  const productsSnap = await getDocs(collection(db, "products"));
  let updated = 0;

  for (const productDoc of productsSnap.docs) {
    const data = productDoc.data();
    const id = productDoc.id;
    const name = data.name;

    if (fallbackImages[name]) {
      await updateDoc(doc(db, "products", id), { imageUrl: fallbackImages[name] });
      console.log(`Updated ${name} with fallback Unsplash image.`);
      updated++;
    }
  }

  console.log(`Updated ${updated} products in Firebase.`);
}

main().catch(console.error);
