import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHkuyoGEVpVtszL1vwZfViJSNDrfu_8lc",
  projectId: "restoranotomasyon-d8055",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, "orders"));
  for (const d of snap.docs) {
    const data = d.data();
    if (data.createdAt && typeof data.createdAt.toDate !== 'function') {
      console.log(`Deleting corrupted order ${d.id}...`);
      await deleteDoc(doc(db, "orders", d.id));
    }
  }
  console.log("Cleanup complete!");
  process.exit(0);
}
run();
