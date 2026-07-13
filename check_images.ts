import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
  const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const missing = products.filter(p => !p.imageUrl);
  console.log("Total Products:", products.length);
  console.log("Missing Images:", missing.length);
  missing.forEach(p => console.log(`- ${p.name} (ID: ${p.id})`));
}

main().catch(console.error);
