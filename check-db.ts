import { db } from "./src/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";

async function check() {
  try {
    const p = await getDocs(collection(db, "products"));
    const c = await getDocs(collection(db, "categories"));
    console.log(`Products: ${p.size}, Categories: ${c.size}`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
check();
