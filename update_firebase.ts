import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";

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

async function main() {
  const productsSnap = await getDocs(collection(db, "products"));
  let updated = 0;

  for (const productDoc of productsSnap.docs) {
    const data = productDoc.data();
    const id = productDoc.id;
    let updates: any = {};

    // Add mock nutrition if not present
    if (!data.nutrition) {
      updates.nutrition = {
        calories: Math.floor(Math.random() * 500) + 200, // 200-700
        protein: Math.floor(Math.random() * 40) + 10, // 10-50
        fat: Math.floor(Math.random() * 30) + 5, // 5-35
        carbs: Math.floor(Math.random() * 80) + 10, // 10-90
      };
    }

    // Add mock ingredients if not present
    if (!data.ingredients) {
      updates.ingredients = [
        { name: "Ana Malzeme", amount: "1 Porsiyon" },
        { name: "Zeytinyağı", amount: "10ml" },
        { name: "Özel Sos", amount: "20g" }
      ];
    }

    // Update specific images
    if (id === "prod_006" || data.name.includes("Pide")) {
      updates.imageUrl = "/images/pide_lux.jpg";
    }
    if (id === "prod_006_2" || data.name.includes("Mantı")) {
      updates.imageUrl = "/images/manti_lux.jpg";
    }
    if (id === "prod_006_3" || data.name.includes("Lahmacun")) {
      updates.imageUrl = "/images/lahmacun_lux.jpg";
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, "products", id), updates);
      updated++;
    }
  }

  console.log(`Updated ${updated} products in Firebase.`);
}

main().catch(console.error);
