import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHkuyoGEVpVtszL1vwZfViJSNDrfu_8lc",
  authDomain: "restoranotomasyon-d8055.firebaseapp.com",
  projectId: "restoranotomasyon-d8055",
  storageBucket: "restoranotomasyon-d8055.firebasestorage.app",
  messagingSenderId: "675112504485",
  appId: "1:675112504485:web:ebc7e1abb50ae3ac24114c",
  measurementId: "G-ZDCGL80ES2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "orders"), where("restaurantId", "==", "rest_demo_001"));
  const snap = await getDocs(q);
  console.log(`Found ${snap.docs.length} orders in Firebase!`);
  snap.docs.forEach(d => {
    const data = d.data();
    console.log(`ID: ${d.id} | Table: ${data.tableNumber} | Status: ${data.status} | Waiter: ${data.waiterName || "None"} | Items: ${data.items?.length}`);
  });
  process.exit(0);
}
run();
