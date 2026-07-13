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

const imageMap: Record<string, string> = {
  "Izgara Köfte": "/images/kofte_lux_1783944918152.jpg",
  "Tavuk Şiş": "/images/tavuk_sis_lux_1783944925977.jpg",
  "Karışık Pizza": "/images/pizza_lux_1783944935082.jpg",
  "Mercimek Çorbası": "/images/mercimek_lux_1783944943874.jpg",
  "Caesar Salata": "/images/caesar_lux_1783944953122.jpg",
  "Tavuk Kanat": "/images/kanat_lux_1783944962128.jpg",
  "Türk Çayı": "/images/cay_lux_1783944987292.jpg",
  "Türk Kahvesi": "/images/kahve_lux_1783944997721.jpg",
  "Taze Sıkma Portakal": "/images/portakal_lux_1783945005307.jpg",
  "Limonata": "/images/limonata_lux_1783945014047.jpg",
  "Ayran": "/images/ayran_lux_1783945022637.jpg",
  "Buzlu Kahve": "/images/icedlatte_lux_1783945031631.jpg",
  "Sütlaç": "/images/sutlac_lux_1783945066485.jpg",
  "Baklava": "/images/baklava_lux_1783945074668.jpg",
  "Cheesecake": "/images/cheesecake_lux_1783945083341.jpg",
};

async function main() {
  const productsSnap = await getDocs(collection(db, "products"));
  let updated = 0;

  for (const productDoc of productsSnap.docs) {
    const data = productDoc.data();
    const id = productDoc.id;
    const name = data.name;
    let updates: any = {};

    let keyToMatch = name;
    if (name.includes("Buzlu Kahve")) keyToMatch = "Buzlu Kahve";

    if (imageMap[keyToMatch]) {
      updates.imageUrl = imageMap[keyToMatch];
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, "products", id), updates);
      console.log(`Updated ${name} with ${updates.imageUrl}`);
      updated++;
    }
  }

  console.log(`Updated ${updated} products in Firebase.`);
}

main().catch(console.error);
