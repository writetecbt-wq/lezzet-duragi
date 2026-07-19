import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where, limit, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHkuyoGEVpVtszL1vwZfViJSNDrfu_8lc",
  projectId: "restoranotomasyon-d8055",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const q = query(collection(db, "orders"));
  const snap = await getDocs(q);
  const recent = snap.docs.slice(-5);
  recent.forEach(d => {
    const data = d.data();
    console.log(`ID: ${d.id}`);
    console.log(`tableNumber: ${data.tableNumber} (type: ${typeof data.tableNumber})`);
    console.log(`status: ${data.status} (type: ${typeof data.status})`);
    console.log(`waiterName: ${data.waiterName} (type: ${typeof data.waiterName})`);
    console.log(`createdAt:`, data.createdAt);
    console.log("---");
  });
  process.exit(0);
}
run();
